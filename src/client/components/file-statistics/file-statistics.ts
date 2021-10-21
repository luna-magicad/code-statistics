import './file-statistics-results.js';

export class FileStatistics extends HTMLElement {
  startAnalyzeButton: HTMLButtonElement;
  analyzingMessage: HTMLElement;

  constructor() {
    super();

    this.initDOM();
    this.initEvents();
  }

  private addStyle(): void {

  }

  private getContainerHTML(): string {
    return `
<div>
  <button class="start-analyze">Analyze</button>
  <div class="analyzing-message" style="display: none;">Is analyzing ...</div>
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
    this.initAnalyzeButton();

    this.shadowRoot!.appendChild(container);
  }

  private initAnalyzeButton(): void {
    this.startAnalyzeButton.addEventListener('click', () => {
      this.startAnalyzeButton.disabled = true;
      this.analyzingMessage.style.display = '';

      this.requestAnalyzeData();
    });
  }

  private initEvents(): void {
  }

  private requestAnalyzeData(): void {
    document.addEventListener('analyzeRequestDataFetched', () => {
      setTimeout(() => {
        this.startAnalyzeButton.disabled = false;
        this.analyzingMessage.style.display = 'none';
      }, 1000);
    }, { once: true });

    const event = new CustomEvent<unknown>('analyzeRequestData', {
      detail: {},
    });
    this.dispatchEvent(event);
  }

}

customElements.define('file-statistics', FileStatistics);
