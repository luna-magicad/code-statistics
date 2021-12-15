import './file-statistics-results.js';
import { FileStatisticsAnalysingStatus } from './file-statistics-analysing-status.js';
import type { FileStatisticsResults } from './file-statistics-results';
import type { AnalyzeRequestDataEvent } from './analyze-request-data-event';
import type { AnalyzeRequestDataFetchedEvent } from './analyze-request-data-fetched-event';
import type { AnalysisResult } from '../../../shared/models/analysis-result';

export class FileStatistics extends HTMLElement {
  startAnalyzeButton!: HTMLButtonElement;
  analyzingMessage!: HTMLElement;

  fileStatisticsResults!: FileStatisticsResults;

  private readonly boundOnAnalysisStatusUpdate: (status: FileStatisticsAnalysingStatus, message: string, data?: AnalysisResult) => void;

  constructor() {
    super();

    this.boundOnAnalysisStatusUpdate = this.onAnalysisStatusUpdate.bind(this);
    this.initDOM();
    this.initEvents();
  }

  private addStyle(): void {
    const style = document.createElement('style');
    style.textContent = `
.message {
  margin: 0;
}
.error {
  color: red;
}
    `;

    this.shadowRoot!.append(style);

  }

  private getContainerHTML(): string {
    return `
<div>
  <button class="start-analyze">Analyze</button>
  <div class="analyzing-message"></div>
  <file-statistics-results></file-statistics-results>
</div>
    `;
  }

  private initDOM(): void {
    this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.className = 'statistics-results';
    container.innerHTML = this.getContainerHTML();

    this.startAnalyzeButton = container.querySelector<HTMLButtonElement>('.start-analyze')!;
    this.analyzingMessage = container.querySelector<HTMLDivElement>('.analyzing-message')!;
    this.fileStatisticsResults = container.querySelector<FileStatisticsResults>('file-statistics-results')!;
    this.initAnalyzeButton();

    this.addStyle();
    this.shadowRoot!.appendChild(container);
  }

  private initAnalyzeButton(): void {
    this.startAnalyzeButton.addEventListener('click', () => {
      this.startRequestAnalyzeData();
    });
  }

  private initEvents(): void {
  }

  private onAnalysisStatusUpdate(status: FileStatisticsAnalysingStatus, message: string, data?: AnalysisResult): void {
    this.addAnalyzingMessage(message, status === FileStatisticsAnalysingStatus.Error);

    if (status === FileStatisticsAnalysingStatus.Done) {
      this.fileStatisticsResults.result = data;
      this.startAnalyzeButton.disabled = false;
    }
  }

  private startRequestAnalyzeData(): void {
    this.startAnalyzeButton.disabled = true;
    this.analyzingMessage.innerHTML = '';

    document.addEventListener('analyzeRequestDataFetched', (event) => {
      this.onAnalyzeRequestDataFetched(event as CustomEvent<AnalyzeRequestDataFetchedEvent>);
    }, { once: true });

    const event = new CustomEvent<AnalyzeRequestDataEvent>('analyzeRequestData');
    this.dispatchEvent(event);
  }

  private onAnalyzeRequestDataFetched(event: CustomEvent<AnalyzeRequestDataFetchedEvent>): void {
    const { detail: data } = event;
    if (!data.includedPaths.length) {
      this.addAnalyzingMessage('Need to have at least 1 included path.', true);
      this.startAnalyzeButton.disabled = false;
      return;
    }

    if (!data.fileTypes.length) {
      this.addAnalyzingMessage('Need to have at least 1 file extension.', true);
      this.startAnalyzeButton.disabled = false;
      return;
    }

    // Now we have the data so lets make another request to tell the application to parse all the files.
    this.addAnalyzingMessage('Started analyzing...', false);

    (<any>window).api.analyzeCodeStatistics(data, this.boundOnAnalysisStatusUpdate);
  }

  private addAnalyzingMessage(message: string, isError: boolean): void {
    const element = document.createElement('p');
    element.className = 'message';

    if (isError) {
      element.classList.add('error');
    }

    element.textContent = message;
    this.analyzingMessage.appendChild(element);
  }
}

customElements.define('file-statistics', FileStatistics);
