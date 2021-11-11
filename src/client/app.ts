import './components/file-type-selector/file-types-selector.js';
import './components/project-selector/project-selector.js';
import './components/file-statistics/file-statistics.js';
import { initAnalyzeRequests } from './components/file-statistics/analyze-request-data-handler.js';

import type { FileTypesSelector } from './components/file-type-selector/file-types-selector';
import type { ProjectSelector } from './components/project-selector/project-selector';
import type { FileStatistics } from './components/file-statistics/file-statistics';

(function(): void {
  window.addEventListener('DOMContentLoaded', () => {
    const fileTypeSelector = document.querySelector<FileTypesSelector>('file-types-selector');
    const projectSelector = document.querySelector<ProjectSelector>('project-selector');
    const fileStatistics = document.querySelector<FileStatistics>('file-statistics');

    if (!fileTypeSelector) {
      document.body.innerHTML += `<p style="color: red;">Failed to find file types selector.</p>`;
      return;
    }
    if (!projectSelector) {
      document.body.innerHTML += `<p style="color: red;">Failed to find project selectors.</p`;
      return;
    }
    if (!fileStatistics) {
      document.body.innerHTML += `<p style="color: red;">Failed to find file statistics</p>`;
      return;
    }

    initAnalyzeRequests(fileStatistics, fileTypeSelector, projectSelector);
  });


})();


