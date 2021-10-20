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
  ];

  constructor() {
    super();

    this.initDOM();
  }

  connectedCallback(): void {
    console.log('I was added to the main page');
  }

  initStyle(): void {
    const style = document.createElement('style');
    style.textContent = `
.selected-extensions {
  display: flex;
  flex-wrap: wrap;
}
    `;

    this.shadowRoot!.append(style);
  }

  initDOM(): void {
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.className = 'file-type-selector';
    wrapper.innerHTML = `
<h3>File extension selections</h3>
<label>
  <input type="text" name="file-extension" placeholder="File extension">
</label>
<br>
<div class="selected-extensions"></div>
    `;

    const fileExtensionsAddElement = wrapper.querySelector<HTMLInputElement>('input[name=file-extension]');
    fileExtensionsAddElement!.addEventListener('blur', (event) => {
      this.addFileExtension(fileExtensionsAddElement!.value);
      fileExtensionsAddElement!.value = '';
    });

    this.renderSelectedExtensions(wrapper);

    this.initStyle();
    this.shadowRoot!.appendChild(wrapper);
  }

  renderSelectedExtensions(queryElement: HTMLElement | ShadowRoot): void {
    const extensionsElement = queryElement!.querySelector<HTMLDivElement>('.selected-extensions');
    if (!extensionsElement) {
      return;
    }

    extensionsElement.innerHTML = '';

    const fragment = document.createDocumentFragment();

    for (const extension of this.fileExtensions) {
      const extensionElement = document.createElement('div');
      extensionElement.innerHTML = `
<label>
  <input type="checkbox"><span>${extension.extension}</span>
</label>
      `;

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

  addFileExtension(extension: string): void {
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

