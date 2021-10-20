export class FileTypesSelector extends HTMLElement {
  fileTypes: string[] = ['ts', 'css', 'scss', 'js', 'cs'];

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    `;

    this.shadowRoot!.appendChild(wrapper);
  }

  connectedCallback(): void {
    console.log('I was added to the main page');
  }
}

customElements.define('file-types-selector', FileTypesSelector);

