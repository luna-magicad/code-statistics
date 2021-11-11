import type { AnalyzeRequestDataFetchedEvent } from './shared/models/analyze-request-data-fetched-event';
import { FileStatisticsAnalysingStatus } from './shared/models/enums/file-statistics-analysing-status';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openFileExplorer: (callback: (selection: string[] | undefined) => void) => {
    ipcRenderer.once('selectedDirectory', (event: unknown, selection: string[] | undefined) => {
      callback(selection);
    });
    ipcRenderer.send('openFileExplorer');
  },

  analyzeCodeStatistics: (data: AnalyzeRequestDataFetchedEvent, callback: (status: FileStatisticsAnalysingStatus, message: string) => void) => {
    function onAnalysisUpdate(event: unknown, message: string): void {
      callback(FileStatisticsAnalysingStatus.Updated, message);
    }

    function onAnalysisDone(event: unknown, message: string): void {
      ipcRenderer.removeListener('analysisUpdate', onAnalysisUpdate);
      ipcRenderer.removeListener('analysisDone', onAnalysisDone);
      ipcRenderer.removeListener('analysisError', onAnalysisError);
      callback(FileStatisticsAnalysingStatus.Done, message);
    }

    function onAnalysisError(event: unknown, message: string): void {
      callback(FileStatisticsAnalysingStatus.Error, message);
    }

    ipcRenderer.on('analysisUpdate', onAnalysisUpdate);
    ipcRenderer.on('analysisDone', onAnalysisDone);
    ipcRenderer.on('analysisError', onAnalysisError);

    ipcRenderer.send('analyzeCode', data);
  },
})
