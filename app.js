class ImageConverter {
  constructor() {
    this.uploadArea = document.getElementById('uploadArea');
    this.fileInput = document.getElementById('imgInput');
    this.convertBtn = document.getElementById('convertBtn');
    this.loading = document.getElementById('loading');
    this.resultsSection = document.getElementById('resultsSection');
    this.originalImage = document.getElementById('originalImage');
    this.resultImage = document.getElementById('resultImage');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.progressBar = document.getElementById('progressBar');
    this.progressFill = document.getElementById('progressFill');

    this.selectedFile = null;
    this.convertedBlob = null;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Upload area interactions
    this.uploadArea.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    // Drag and drop
    this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.uploadArea.addEventListener('dragleave', () => this.handleDragLeave());
    this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

    // Convert button
    this.convertBtn.addEventListener('click', () => this.convertImage());

    // Download button
    this.downloadBtn.addEventListener('click', () => this.downloadImage());
  }

  handleDragOver(e) {
    e.preventDefault();
    this.uploadArea.classList.add('drag-over');
  }

  handleDragLeave() {
    this.uploadArea.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    this.uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      this.handleFileSelect({ target: { files: files } });
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.showToast('File size must be less than 10MB', 'error');
      return;
    }

    this.selectedFile = file;
    this.showFilePreview(file);
    this.enableConvertButton();
  }

  showFilePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.originalImage.src = e.target.result;
      this.uploadArea.innerHTML = `
        <div class="upload-icon">✅</div>
        <div class="upload-text">Image ready for conversion</div>
        <div class="upload-hint">${file.name} (${this.formatFileSize(file.size)})</div>
      `;
    };
    reader.readAsDataURL(file);
  }

  enableConvertButton() {
    this.convertBtn.disabled = false;
    this.convertBtn.classList.add('show');
  }

  async convertImage() {
    if (!this.selectedFile) return;

    this.convertBtn.disabled = true;
    this.convertBtn.textContent = '🔄 Converting...';
    this.loading.style.display = 'block';
    this.progressBar.style.display = 'block';

    // Simulate progress
    this.animateProgress();

    try {
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      const response = await fetch('/convert', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        this.convertedBlob = await response.blob();
        this.displayResult();
        this.showToast('Image converted successfully!');
      } else {
        throw new Error('Conversion failed');
      }
    } catch (error) {
      this.showToast('Failed to convert image. Please try again.', 'error');
    } finally {
      this.resetUI();
    }
  }

  animateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      this.progressFill.style.width = `${progress}%`;
    }, 200);
  }

  displayResult() {
    const url = URL.createObjectURL(this.convertedBlob);
    this.resultImage.src = url;
    this.resultsSection.classList.add('show');
    
    // Smooth scroll to results
    this.resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  downloadImage() {
    if (!this.convertedBlob) return;

    const url = URL.createObjectURL(this.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grayscale-converted.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Image downloaded successfully!');
  }

  resetUI() {
    this.convertBtn.disabled = false;
    this.convertBtn.textContent = '✨ Convert to Grayscale';
    this.loading.style.display = 'none';
    this.progressBar.style.display = 'none';
    this.progressFill.style.width = '0%';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new ImageConverter();
});