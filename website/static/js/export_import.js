class FileManager {
  constructor(options = {}) {
    this.exportHandler = options.exportHandler || null;
    this.importHandler = options.importHandler || null;
    this.fileExtension = options.fileExtension || '.json';
  }

  // === Define custom handlers later if desired ===
  setExportHandler(handler) {
    this.exportHandler = handler;
  }

  setImportHandler(handler) {
    this.importHandler = handler;
  }

  setFileExtension(ext) {
    this.fileExtension = ext.startsWith('.') ? ext : `.${ext}`;
  }

  // === Export ===
  export(data, filename = 'exported') {
    if (!this.exportHandler) {
      console.error('Export handler not defined!');
      return;
    }

    const processedData = this.exportHandler(data);
    const blob = new Blob([processedData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}${this.fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // === Import ===
  import() {
    if (!this.importHandler) {
      console.error('Import handler not defined!');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = this.fileExtension;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target.result;
        this.importHandler(content, file.name);
      };
      reader.readAsText(file);
    };

    input.click();
  }
}
