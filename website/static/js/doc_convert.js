class DocxUploader {
  constructor(uploadUrl) {
    this.uploadUrl = uploadUrl;

    // Optional callbacks
    this.onFileSelected = null;  // Called after file is chosen
    this.onProgress = null;      // Called on upload progress
    this.onComplete = null;      // Called when upload succeeds
    this.onError = null;         // Called when something fails
  }

  // Trigger file picker
  openFilePicker() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".docx";
    input.style.display = "none";

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (this.onFileSelected) this.onFileSelected(file);
      this.uploadFile(file);
    });

    document.body.appendChild(input);
    input.click();
  }

  // Upload file with progress and callbacks
  uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", this.uploadUrl, true);

    // Upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = ((e.loaded / e.total) * 100).toFixed(2);
        console.log(`Upload Progress: ${percent}%`);
        if (this.onProgress) this.onProgress(percent, e);
      }
    });

    // Upload finished
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (this.onComplete) this.onComplete(response);
        } catch (err) {
          console.error("Response parse error:", err);
          if (this.onError) this.onError(err);
        }
      } else {
        console.error("Upload failed:", xhr.statusText);
        if (this.onError) this.onError(xhr.statusText);
      }
    };

    xhr.onerror = () => {
      console.error("Upload network error");
      if (this.onError) this.onError("Network error");
    };

    xhr.send(formData);
  }
}
