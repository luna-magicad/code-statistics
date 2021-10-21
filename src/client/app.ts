import './components/file-type-selector/file-types-selector.js';
import './components/project-selector/project-selector.js';

import type { FileTypesSelector } from './components/file-type-selector/file-types-selector';
import type { ProjectSelector } from './components/project-selector/project-selector';

window.addEventListener('DOMContentLoaded', () => {
  const fileTypeSelector = document.querySelector<FileTypesSelector>('file-types-selector');
  const projectSelector = document.querySelector<ProjectSelector>('project-selector');
});
