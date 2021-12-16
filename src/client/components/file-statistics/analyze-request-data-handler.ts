import type { FileStatistics } from './file-statistics';
import type { FileTypesSelector } from '../file-type-selector/file-types-selector';
import type { ProjectSelector } from '../project-selector/project-selector';
import type { AnalyzeRequestDataFetchedEvent } from '../../../shared/models/analyze-request-data-fetched-event';

export function initAnalyzeRequests(fileStatistics: FileStatistics, fileTypesSelector: FileTypesSelector, projectSelector: ProjectSelector): void {
  fileStatistics.addEventListener('analyzeRequestData', () => {
    onAnalyzeRequestData(fileTypesSelector,  projectSelector);
  });
}

function onAnalyzeRequestData(fileTypesSelector: FileTypesSelector, projectSelector: ProjectSelector): void {
  const fileTypes = fileTypesSelector.fileExtensions.filter(fe => fe.active).map(fe => {
    let extension = fe.extension.toLowerCase();
    if (extension[0] !== '.') {
      extension = '.' + extension;
    }

    return extension;
  });
  const includedPaths = [...projectSelector.includedPaths];
  const excludedPaths = [...projectSelector.excludedPaths];

  const dispatchEvent = new CustomEvent<AnalyzeRequestDataFetchedEvent>('analyzeRequestDataFetched', {
    detail: {
      fileTypes,
      includedPaths,
      excludedPaths,
    },
  });
  document.dispatchEvent(dispatchEvent);
}
