import './paths-selector.js';
import type { PathsSelector } from './paths-selector';
import { PathsChangeEvent } from './paths-change-event';

export class ProjectSelector extends HTMLElement {
  includedPaths: string[] = [];
  excludedPaths: string[] = ['node_modules', 'bin', 'obj', 'dist', 'build'];

  constructor() {
    super();

    this.initDOM();
  }

  private addStyle(): void {

  }

  private getContainerHTML(): string {
    return `
<h3 style="margin: 0">Project selection</h3>
<div style="display: grid; grid-template-columns: 1fr 1fr; grid-gap: 5px;">
  <paths-selector class="included-paths" data-header="Included Paths" data-paths=""></paths-selector>
  <paths-selector class="excluded-paths" data-header="Excluded Paths" data-paths=""></paths-selector>
</div>
    `;
  }

  private initDOM(): void {
    this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.className = 'project-selector';
    container.innerHTML = this.getContainerHTML();

    const includedElement = container.querySelector<PathsSelector>('.included-paths');
    const excludedElement = container.querySelector<PathsSelector>('.excluded-paths');

    includedElement!.paths = this.includedPaths;
    excludedElement!.paths = this.excludedPaths;

    this.shadowRoot!.appendChild(container);
    this.initEvents();
  }

  private initEvents(): void {
    const includedElement = this.shadowRoot!.querySelector<PathsSelector>('.included-paths');
    const excludedElement = this.shadowRoot!.querySelector<PathsSelector>('.excluded-paths');

    includedElement!.addEventListener('pathsChanged', (event) => this.onIncludedPathsChanged(event as CustomEvent<PathsChangeEvent>));
    excludedElement!.addEventListener('pathsChanged', (event) => this.onExcludedPathsChanged(event as CustomEvent<PathsChangeEvent>));
  }

  private onIncludedPathsChanged(event: CustomEvent<PathsChangeEvent>) {
    this.includedPaths = event.detail.paths;
  }

  private onExcludedPathsChanged(event: CustomEvent<PathsChangeEvent>) {
    this.excludedPaths = event.detail.paths;
  }
}

customElements.define('project-selector', ProjectSelector);
