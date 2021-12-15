import type { AnalysisResult } from '../../../shared/models/analysis-result';

export class FileStatisticsResults extends HTMLElement {
  private resultsContainer!: HTMLElement;

  private hasSetResult: boolean = false;

  private _result: AnalysisResult | undefined;
  set result(value: AnalysisResult | undefined) {
    this.hasSetResult = true;
    this.shadowRoot!.querySelector<HTMLHeadElement>('h3')!.style.display = '';

    this._result = value;
    this.updateResults();
  };

  constructor() {
    super();

    this.initDOM();
  }

  private addStyle(): void {
    const style = document.createElement('style');
    style.textContent = `
.errors {
  color: red;
}
.characters, .lines {
  white-space: nowrap;
}
    `;

    this.shadowRoot!.append(style);
  }

  private getContainerHTML(): string {
    return `
<h3 style="margin: 0; display: none;">File Statistics Results:</h3>
<div class="results"></div>
    `;
  }

  private initDOM(): void {
    this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.className = 'file-statistics-result';
    container.innerHTML = this.getContainerHTML();

    this.resultsContainer = container.querySelector<HTMLElement>('.results')!;

    this.addStyle();
    this.shadowRoot!.appendChild(container);
  }

  private updateResults(): void {
    this.clearView();
    if (!this._result) {
      return;
    }

    const documentFragment = document.createDocumentFragment();

    const errors = this.addErrors();
    const results = this.addResults();

    documentFragment.appendChild(errors);
    documentFragment.appendChild(results);

    this.resultsContainer.appendChild(documentFragment);
  }

  private clearView(): void {
    this.resultsContainer.innerHTML = '';
  }

  private addErrors(): HTMLElement {
    const errors = document.createElement('errors');
    errors.className = 'errors';

    for (const failed of this._result!.failed) {
      const element = document.createElement('div');
      element.innerHTML = `${failed.file} - ${failed.error}`;
    }
    return errors;
  }

  private addResults(): HTMLElement {
    const results = document.createElement('div');
    for (const fileExtension of Object.keys(this._result!.results)) {
      const extensionElement = this.addExtension(fileExtension);
      results.appendChild(extensionElement);
    }

    return results;
  }

  private addExtension(fileExtension: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'file-results';
    const fileResults = this._result!.results[fileExtension];

    let totalCharacters = 0;
    let totalLines = 0;

    const resultsFragment = document.createDocumentFragment();

    const fileResultsContainer = document.createElement('div');
    resultsFragment.appendChild(fileResultsContainer);
    fileResultsContainer.innerHTML = `
<details>
  <summary>File details</summary>
  <table>
    <thead>
      <tr><td>Characters</td><td>Lines</td><td>file</td></tr>
    </thead>
    <tbody></tbody>
</table>
</details>
    `;
    const tbody = fileResultsContainer.querySelector<HTMLTableSectionElement>('tbody')!;

    for (const fileResult of fileResults) {
      const fileResultElement = document.createElement('tr');
      fileResultElement.className = 'file-result';
      totalCharacters += fileResult.characters;
      totalLines += fileResult.lines;

      fileResultElement.innerHTML = `<td class="characters">characters: ${fileResult.characters},</td><td class="lines"> lines: ${fileResult.lines}</td><td>${fileResult.file}</td>`;
      fileResultElement.title = fileResult.file;
      tbody.appendChild(fileResultElement);
    }

    const summaryElement = document.createElement('div');
    summaryElement.innerHTML = `<strong>${fileExtension}</strong> - total characters: ${totalCharacters}, total lines: ${totalLines}`;

    container.appendChild(summaryElement);
    container.appendChild(resultsFragment);

    return container;
  }
}

customElements.define('file-statistics-results', FileStatisticsResults);
