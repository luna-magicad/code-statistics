import type { AnalysisResult } from '../../shared/models/analysis-result';
import type { Stats } from 'fs';
import type { AnalyzeRequestDataFetchedEvent } from '../../shared/models/analyze-request-data-fetched-event';
import type { FailedAnalysis } from '../../shared/models/failed-analysis';
import type { AnalysisFileResult } from '../../shared/models/analysis-file-result';

const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

interface FilesByExtension {
  [filetype: string]: string[];
}

type FilepathStatTuple = [absolutepath: string, extension: string, stats: Stats];

async function doAnalysis(event: any, data: AnalyzeRequestDataFetchedEvent): Promise<void> {
  let result: AnalysisResult | undefined;
  try {
    const filesByExtension = await getFiles(data.includedPaths, data.excludedPaths, data.fileTypes);
    result = await analyzeAllFiles(filesByExtension, event);
  } catch (e) {
    event.reply('analysisError', `An unexpected error occurred: ${e}`);
  }
  event.reply('analysisDone', 'Analysis done.', result);
}

async function analyzeAllFiles(filesbyExtension: FilesByExtension, event: any): Promise<AnalysisResult> {
  const analysisResults: Record<string, AnalysisFileResult[]> = {};
  const failedAnalysises: FailedAnalysis[] = [];
  const allPromises: Promise<unknown>[] = [];

  for (const extension of Object.keys(filesbyExtension)) {
    const files = filesbyExtension[extension];
    for (const file of files) {
      allPromises.push(
        analyzeFile(file, extension).then(result => {
          if (!analysisResults[extension]) {
            analysisResults[extension] = [];
          }
          analysisResults[extension].push(result);
        }).catch((error) => {
          failedAnalysises.push({
            file,
            extension,
            error,
          });
        }),
      );
    }
  }

  await Promise.allSettled(allPromises);

  return {
    results: analysisResults,
    failed: failedAnalysises,
  };
}

async function analyzeFile(path: string, extension: string): Promise<AnalysisFileResult> {
  const result = await fs.promises.readFile(path, { encoding: 'utf8' });
  const lines = result.split(/\r\n|\r|\n/).length;

  return {
    file: path,
    characters: result.length,
    lines,
    fileExtension: extension,
  }
}

async function getFiles(includePaths: string[], excludedPaths: string[], fileTypes: string[]): Promise<FilesByExtension> {
  if (!includePaths.length || !fileTypes.length) {
    return {};
  }

  let result: Record<string, string[]> = {};

  try {
    let promises: Promise<void>[] = [];
    for (const includePath of includePaths) {
      promises.push(getFilesForDirectory(includePath, excludedPaths, fileTypes, result));
    }
    await Promise.allSettled(promises);
  } catch (e) {

  }

  return result;
}

function getFilesForDirectory(rootpath: string, excludedPaths: string[], fileTypes: string[], result: Record<string, string[]>): Promise<void> {
  let promise = new Promise<void>(async (res, rej) => {
    let files: string[] = [];
    try {
      files = await fs.promises.readdir(rootpath);
    } catch (e) {
      console.log(`Failed to read directory ${rootpath} - ${e}`);
      res();
    }

    let promises: Promise<FilepathStatTuple>[] = [];
    for (const file of files) {
      const isExcluded = excludedPaths.some(e => file.includes(e));
      if (isExcluded) {
        continue;
      }

      const absolutepath = path.join(rootpath, file);
      // Extension can be undefined if the path is a directory.
      const extension = path.parse(absolutepath)?.ext.toLowerCase() || '';
      if ((file[0] == '.' || extension) && !fileTypes.includes(extension)) {
        continue;
      }

      const filePromise = new Promise<FilepathStatTuple>((res, rej) => {
        fs.promises.lstat(absolutepath)
          .then((stats: Stats) => res([absolutepath, extension, stats]))
          .catch((reason: unknown) => rej(`Failed to get stat for file: ${reason}`));
      });
      promises.push(filePromise);
    }

    const settledPromises = await Promise.allSettled(promises);
    const pathStats: FilepathStatTuple[] = [];
    settledPromises.forEach(promise => {
      if (promise.status === 'fulfilled') {
        pathStats.push(promise.value);
      }
    });

    const directoryPromises: Promise<void>[] = [];

    for (const [absolutepath, extension, stats] of pathStats) {
      if (stats.isDirectory()) {
        directoryPromises.push(getFilesForDirectory(absolutepath, excludedPaths, fileTypes, result));
      } else if (stats.isFile()) {
        let extensionResults = result[extension];
        if (!extensionResults) {
          extensionResults = [];
          result[extension] = extensionResults;
        }
        extensionResults.push(absolutepath);
      }
    }

    await Promise.allSettled(directoryPromises);
    res();
  });

  return promise;
}

exports.setupAnalyzeCode = function(): void {
  ipcMain.on('analyzeCode', (event: any, data: AnalyzeRequestDataFetchedEvent) => {
    doAnalysis(event, data).then();
  });
}
