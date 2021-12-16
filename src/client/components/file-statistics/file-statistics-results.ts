import type { AnalysisResult } from '../../../shared/models/analysis-result';
import type { AnalyzeResponseDone } from './analyze-response-done';

export class FileStatisticsResults extends HTMLElement {
  private resultsContainer!: HTMLElement;

  private hasSetResult: boolean = false;

  private includedPaths: string[] | undefined = [];
  private result: AnalysisResult | undefined;


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

  setResponse(value: AnalyzeResponseDone | undefined) {
    this.hasSetResult = true;
    this.shadowRoot!.querySelector<HTMLHeadElement>('h3')!.style.display = '';

    this.includedPaths = value?.request.includedPaths;
    this.result = value?.data;
    this.updateResults();
  };

  private updateResults(): void {
    this.clearView();
    if (!this.result || !this.includedPaths?.length) {
      return;
    }

    this.includedPaths.sort((a, b) => b.length - a.length);

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

    for (const failed of this.result!.failed) {
      const element = document.createElement('div');
      element.innerHTML = `${failed.file} - ${failed.error}`;
    }
    return errors;
  }

  private addResults(): HTMLElement {
    const results = document.createElement('div');
    for (const fileExtension of Object.keys(this.result!.results)) {
      const extensionElement = this.addExtension(fileExtension);
      results.appendChild(extensionElement);
    }

    return results;
  }

  private addExtension(fileExtension: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'file-results';
    const fileResults = this.result!.results[fileExtension];

    fileResults.sort((a, b) => {
      const sortByLines = b.lines - a.lines;
      if (sortByLines !== 0) {
        return sortByLines;
      }

      return b.characters - a.characters;
    });

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
      <tr><td>Lines</td><td>Characters</td><td>file</td></tr>
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

      const shortenedFileName = this.getShortenedFilename(fileResult.file);

      fileResultElement.innerHTML = `<td class="lines">lines: ${fileResult.lines},</td><td class="characters"> characters: ${fileResult.characters}</td><td>${shortenedFileName}</td>`;
      fileResultElement.title = fileResult.file;
      tbody.appendChild(fileResultElement);
    }

    const summaryElement = document.createElement('div');
    summaryElement.innerHTML = `<strong>${fileExtension}</strong> - total files: ${fileResults.length}, - total lines: ${totalLines}, - total characters: ${totalCharacters}`;

    container.appendChild(summaryElement);
    container.appendChild(resultsFragment);

    return container;
  }

  private getShortenedFilename(file: string): string {
    for (const includePath of this.includedPaths!) {
      if (file.startsWith(includePath)) {
        return file.substring(includePath.length);
      }
    }

    return file;
  }
}

customElements.define('file-statistics-results', FileStatisticsResults);
