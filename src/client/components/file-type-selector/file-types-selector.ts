interface FileExtension {
  extension: string;
  active: boolean;
}

export class FileTypesSelector extends HTMLElement {
  fileExtensions: FileExtension[] = [
    { extension: 'ts', active: true, },
    { extension: 'css', active: true, },
    { extension: 'scss', active: true, },
    { extension: 'js', active: true, },
    { extension: 'cs', active: true, },
    { extension: 'html', active: true },
  ];

  constructor() {
    super();

    this.initDOM();
  }

  addStyle(): void {
    const style = document.createElement('style');
    style.textContent = `
.extensions {
  display: flex;
  flex-wrap: wrap;
}
    `;

    this.shadowRoot!.append(style);
  }

  private getContainerHTML(): string {
    return `
<h3 style="margin: 5px 0;">File type selections</h3>
<label>
  <input type="text" name="file-extension" placeholder="File extension">
</label>
<br>
<div class="extensions" style="margin-top: 5px;"></div>
    `;
  }

  private getExtensionHTML(extension: string): string {
    return `
<label>
  <input type="checkbox"><span>${extension}</span>
</label>
      `;
  }

  initDOM(): void {
    this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.className = 'file-type-selector';
    container.innerHTML = this.getContainerHTML();

    const fileExtensionsAddElement = container.querySelector<HTMLInputElement>('input[name=file-extension]');
    fileExtensionsAddElement!.addEventListener('blur', (event) => {
      this.addFileExtension(fileExtensionsAddElement!.value);
      fileExtensionsAddElement!.value = '';
    });

    this.renderSelectedExtensions(container);

    this.addStyle();
    this.shadowRoot!.appendChild(container);
  }

  private renderSelectedExtensions(queryElement: HTMLElement | ShadowRoot): void {
    const extensionsElement = queryElement!.querySelector<HTMLDivElement>('.extensions');
    if (!extensionsElement) {
      return;
    }

    extensionsElement.innerHTML = '';

    const fragment = document.createDocumentFragment();

    for (const extension of this.fileExtensions) {
      const extensionElement = document.createElement('div');
      extensionElement.innerHTML = this.getExtensionHTML(extension.extension);

      // Set up the checkbox element
      const checkboxElement = extensionElement.querySelector('input');
      checkboxElement!.checked = extension.active;
      checkboxElement!.addEventListener('change', () => {
        extension.active = checkboxElement!.checked;
      });

      fragment.appendChild(extensionElement);
    }

    extensionsElement.appendChild(fragment);
  }

  private addFileExtension(extension: string): void {
    if (!extension || this.fileExtensions.find(e => e.extension === extension)) {
      return;
    }

    this.fileExtensions.push({
      extension,
      active: true,
    });

    this.renderSelectedExtensions(this.shadowRoot!);
  }
}

customElements.define('file-types-selector', FileTypesSelector);

