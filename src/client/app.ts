import './components/file-type-selector/file-types-selector.js';
import './components/project-selector/project-selector.js';
import './components/file-statistics/file-statistics.js';

import type { FileTypesSelector } from './components/file-type-selector/file-types-selector';
import type { ProjectSelector } from './components/project-selector/project-selector';
import type { FileStatistics } from './components/file-statistics/file-statistics';

(function(): void {
  window.addEventListener('DOMContentLoaded', () => {
    const fileTypeSelector = document.querySelector<FileTypesSelector>('file-types-selector');
    const projectSelector = document.querySelector<ProjectSelector>('project-selector');
    const fileStatistics = document.querySelector<FileStatistics>('file-statistics');
  });
})();


