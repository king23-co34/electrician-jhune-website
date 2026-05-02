/**
 * Multi-Step Lead Capture Form Manager
 * Steps: 1. Personal Info → 2. Service → 3. Description → 4. Upload
 */

class FormManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.formData = {};
    this.uploadedFiles = [];

    this.form = document.getElementById('quote-form');
    if (!this.form) return;

    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindValidation();
    this.bindUpload();
    this.loadDraft();
    this.updateProgress();
  }

  // ---- Navigation ----
  bindNavigation() {
    this.form.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => this.nextStep());
    });

    this.form.querySelectorAll('[data-prev]').forEach(btn => {
      btn.addEventListener('click', () => this.prevStep());
    });

    const submitBtn = document.getElementById('form-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitForm();
      });
    }
  }

  nextStep() {
    if (!this.validateStep(this.currentStep)) return;
    this.collectStepData(this.currentStep);
    this.saveDraft();

    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  goToStep(step) {
    const currentEl = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
    const targetEl = this.form.querySelector(`.form-step[data-step="${step}"]`);

    if (currentEl) currentEl.classList.remove('active');
    if (targetEl) targetEl.classList.add('active');

    this.currentStep = step;
    this.updateProgress();
    this.updateCounter();

    // Scroll form into view
    this.form.closest('.quote__wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateProgress() {
    const fill = document.getElementById('progress-fill');
    const steps = this.form.querySelectorAll('.form-progress__step');

    const pct = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    if (fill) fill.style.width = `${pct}%`;

    steps.forEach((el, i) => {
      const stepNum = i + 1;
      el.classList.remove('active', 'completed');
      if (stepNum < this.currentStep) el.classList.add('completed');
      else if (stepNum === this.currentStep) el.classList.add('active');
    });
  }

  updateCounter() {
    const counter = document.getElementById('step-counter');
    if (counter) counter.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
  }

  // ---- Validation ----
  bindValidation() {
    this.form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => this.validateField(field));
      field.addEventListener('blur', () => this.validateField(field));
    });
  }

  validateField(field) {
    const group = field.closest('.form-group');
    const errorEl = group?.querySelector('.field-error');
    let valid = true;
    let msg = '';

    field.classList.remove('error', 'success');

    if (field.hasAttribute('required') && !field.value.trim()) {
      valid = false;
      msg = 'This field is required.';
    } else if (field.type === 'email' && field.value.trim()) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(field.value.trim())) {
        valid = false;
        msg = 'Please enter a valid email address.';
      }
    } else if (field.type === 'tel' && field.value.trim()) {
      const cleaned = field.value.replace(/\D/g, '');
      if (cleaned.length < 7 || cleaned.length > 15) {
        valid = false;
        msg = 'Please enter a valid phone number.';
      }
    } else if (field.name === 'name' && field.value.trim()) {
      if (field.value.trim().length < 2) {
        valid = false;
        msg = 'Name must be at least 2 characters.';
      }
    }

    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.toggle('show', !valid);
    }

    field.classList.add(valid ? 'success' : 'error');
    return valid;
  }

  validateStep(step) {
    const stepEl = this.form.querySelector(`.form-step[data-step="${step}"]`);
    if (!stepEl) return true;

    const required = stepEl.querySelectorAll('[required]');
    let allValid = true;

    required.forEach(field => {
      if (!this.validateField(field)) allValid = false;
    });

    if (!allValid) {
      if (typeof toast !== 'undefined') {
        toast.error('Please fill in all required fields.', { title: 'Incomplete' });
      }
    }

    return allValid;
  }

  collectStepData(step) {
    const stepEl = this.form.querySelector(`.form-step[data-step="${step}"]`);
    if (!stepEl) return;

    stepEl.querySelectorAll('.form-control').forEach(field => {
      if (field.name) {
        this.formData[field.name] = field.value.trim();
      }
    });
  }

  // ---- Image Upload ----
  bindUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('upload-preview');

    if (!uploadArea || !fileInput) return;

    // Click to select
    uploadArea.addEventListener('click', (e) => {
      if (!e.target.closest('.upload-preview__remove')) {
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', (e) => {
      this.handleFiles(Array.from(e.target.files));
      fileInput.value = '';
    });

    // Drag & drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragging');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragging');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragging');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      this.handleFiles(files);
    });
  }

  handleFiles(files) {
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach(file => {
      if (this.uploadedFiles.length >= maxFiles) {
        if (typeof toast !== 'undefined') {
          toast.info(`Max ${maxFiles} images allowed.`);
        }
        return;
      }

      if (!file.type.startsWith('image/')) {
        if (typeof toast !== 'undefined') {
          toast.error('Only image files are allowed.');
        }
        return;
      }

      if (file.size > maxSize) {
        if (typeof toast !== 'undefined') {
          toast.error(`${file.name} is too large. Max 10MB per image.`);
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const id = `img-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        this.uploadedFiles.push({ id, file, dataUrl: e.target.result });
        this.renderPreview();
      };
      reader.readAsDataURL(file);
    });
  }

  renderPreview() {
    const preview = document.getElementById('upload-preview');
    if (!preview) return;

    preview.innerHTML = '';

    this.uploadedFiles.forEach(({ id, dataUrl, file }) => {
      const item = document.createElement('div');
      item.className = 'upload-preview__item';
      item.innerHTML = `
        <img src="${dataUrl}" alt="${file.name}" loading="lazy">
        <button class="upload-preview__remove" data-id="${id}" title="Remove" type="button">✕</button>
      `;
      item.querySelector('.upload-preview__remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFile(id);
      });
      preview.appendChild(item);
    });

    const hint = document.getElementById('upload-hint');
    if (hint) {
      hint.textContent = this.uploadedFiles.length > 0
        ? `${this.uploadedFiles.length} photo(s) selected. You can add up to 5.`
        : 'Upload a photo so we can assess your issue faster.';
    }
  }

  removeFile(id) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== id);
    this.renderPreview();
  }

  // ---- LocalStorage Draft ----
  saveDraft() {
    try {
      localStorage.setItem('quote_draft', JSON.stringify(this.formData));
    } catch (e) { /* storage may be unavailable */ }
  }

  loadDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem('quote_draft') || '{}');
      Object.entries(draft).forEach(([name, value]) => {
        const field = this.form.querySelector(`[name="${name}"]`);
        if (field && value) field.value = value;
      });
      if (Object.keys(draft).length > 0) {
        if (typeof toast !== 'undefined') {
          toast.info('Your previous details have been restored.', { duration: 3000 });
        }
      }
    } catch (e) { /* ignore */ }
  }

  // ---- Submit ----
  async submitForm() {
    if (!this.validateStep(this.currentStep)) return;
    this.collectStepData(this.currentStep);

    const loadingId = typeof toast !== 'undefined'
      ? toast.loading('Submitting your request…')
      : null;

    // Simulate async submission
    await new Promise(resolve => setTimeout(resolve, 1800));

    const submission = {
      ...this.formData,
      imageCount: this.uploadedFiles.length,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('quote_submissions') || '[]');
      existing.push(submission);
      localStorage.setItem('quote_submissions', JSON.stringify(existing));
      localStorage.removeItem('quote_draft');
    } catch (e) { /* ignore */ }

    if (loadingId && typeof toast !== 'undefined') {
      toast.update(loadingId, 'Your request has been sent! We\'ll contact you within 24 hours.', 'success', 6000);
    }

    this.showSuccess();
  }

  showSuccess() {
    const formContent = document.getElementById('form-content');
    const successEl = document.getElementById('form-success');

    if (formContent) formContent.style.display = 'none';
    if (successEl) successEl.classList.add('show');
  }

  resetForm() {
    this.currentStep = 1;
    this.formData = {};
    this.uploadedFiles = [];
    this.form.reset();

    const formContent = document.getElementById('form-content');
    const successEl = document.getElementById('form-success');
    if (formContent) formContent.style.display = 'block';
    if (successEl) successEl.classList.remove('show');

    this.goToStep(1);
    this.renderPreview();
  }
}

// Expose globally
const formManager = new FormManager();