const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

import type { Stats } from 'fs';
import type { AnalyzeRequestDataFetchedEvent } from '../../shared/models/analyze-request-data-fetched-event';

type FilepathStatTuple = [absolutepath: string, extension: string, stats: Stats];


async function doAnalysis(event: any, data: AnalyzeRequestDataFetchedEvent): Promise<void> {
  try {
    const files = await getFiles(data.includedPaths, data.excludedPaths, data.fileTypes);
    console.log('all ze files', files);
  } catch (e) {
    event.reply('analysisError', `An unexpected error occurred: ${e}`);
  }

  event.reply('analysisDone', 'Analysis done.');
}

async function getFiles(includePaths: string[], excludedPaths: string[], fileTypes: string[]): Promise<Record<string, string[]>> {
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
