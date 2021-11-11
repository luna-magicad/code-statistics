import { PathsChangeEvent } from './paths-change-event';

export class PathsSelector extends HTMLElement {
  private _paths: string[] = [];

  get paths(): string[] {
    return this._paths;
  }
  set paths(value: string[]) {
    this._paths = value;
    this.renderPaths(this.shadowRoot!);
  }

  constructor() {
    super();

    this.initDOM();
  }

  private addStyle(): void {

    const style = document.createElement('style');
    style.textContent = `
h4 {
  margin: 5px 0;
}
    
.paths {
  margin: 5px 0; 
  padding: 0 5px;
  word-break: break-word; 
}

.paths li {
  margin-left: 15px;
}
    `;

    this.shadowRoot!.append(style);
  }

  private getContainerHTML(header: string): string {
    return `
<h4>${header} <button class="open-directory">Directory</button></h4>
<input name="custom-input" type="text">
<ul class="paths" style="">Some paths here.</ul>
    `;
  }

  private initDOM(): void {
    this.attachShadow({ mode: 'open' });

    const header = this.dataset['header'] ?? 'Paths';

    const container = document.createElement('div');
    container.className = 'paths-selector';
    container.innerHTML = this.getContainerHTML(header);

    const openDirectoryButton = container.querySelector('.open-directory');
    openDirectoryButton!.addEventListener('click', () => this.openFileExplorer());

    const customInput = container.querySelector<HTMLInputElement>('input[name=custom-input]');
    customInput!.addEventListener('blur', () => this.tryAddCustomPath(customInput!));

    this.renderPaths(container);

    this.addStyle();
    this.shadowRoot!.appendChild(container);
  }

  private renderPaths(queryElement: HTMLElement | ShadowRoot): void {
    const element = queryElement.querySelector('.paths');
    if (!element) {
      return;
    }

    element.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (const path of this.paths) {
      const item = document.createElement('li');
      item.innerText = path;
      fragment.appendChild(item);
    }

    element.appendChild(fragment);
  }

  private openFileExplorer(): void {
    const boundCallback = this.onSelectedDirectory.bind(this);
    (<any>window).api.openFileExplorer(boundCallback);
  }

  public onSelectedDirectory(selections: string[] | undefined): void {
    if (!selections?.length) {
      return;
    }

    for (const selection of selections) {
      if (!selection || this.paths.includes(selection)) {
        continue;
      }

      this._paths.push(selection);
    }

    this.renderPaths(this.shadowRoot!);
  }

  private tryAddCustomPath(customInput: HTMLInputElement) {
    if (!customInput.value || this.paths.includes(customInput.value)) {
      return;
    }

    const event = new CustomEvent<PathsChangeEvent>('pathsChanged', {
      detail: {
        paths: this.paths,
      },
    });

    this._paths.push(customInput.value);
    customInput.value = '';
    this.renderPaths(this.shadowRoot!);
    this.dispatchEvent(event);
  }
}

customElements.define('paths-selector', PathsSelector);
