/**
 * Toast Notification System
 * Supports: success | error | loading | info
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.queue = [];
    this.active = new Map();
    this.idCounter = 0;
    this._init();
  }

  _init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  _genId() {
    return `toast-${++this.idCounter}`;
  }

  _iconFor(type) {
    const icons = {
      success: '✅',
      error: '❌',
      loading: '⏳',
      info: 'ℹ️',
    };
    return icons[type] || icons.info;
  }

  _titleFor(type) {
    const titles = {
      success: 'Success',
      error: 'Error',
      loading: 'Please wait…',
      info: 'Info',
    };
    return titles[type] || 'Notice';
  }

  /**
   * Show a toast
   * @param {string} message - Toast message
   * @param {'success'|'error'|'loading'|'info'} type
   * @param {object} options - { title, duration, id }
   * @returns {string} toast id
   */
  show(message, type = 'info', options = {}) {
    const id = options.id || this._genId();
    const title = options.title || this._titleFor(type);
    const duration = type === 'loading' ? 0 : (options.duration ?? 4500);

    // Remove existing toast with same id
    if (this.active.has(id)) this.dismiss(id);

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.id = id;
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');

    el.innerHTML = `
      <span class="toast__icon">${this._iconFor(type)}</span>
      <div class="toast__body">
        <div class="toast__title">${title}</div>
        <div class="toast__message">${message}</div>
      </div>
      <button class="toast__close" aria-label="Close notification">✕</button>
    `;

    el.querySelector('.toast__close').addEventListener('click', () => this.dismiss(id));

    this.container.appendChild(el);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('show'));
    });

    this.active.set(id, { el, timer: null });

    if (duration > 0) {
      const timer = setTimeout(() => this.dismiss(id), duration);
      this.active.get(id).timer = timer;
    }

    return id;
  }

  /**
   * Update an existing toast (useful for loading → success/error)
   * @param {string} id
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration ms, default 3500
   */
  update(id, message, type = 'success', duration = 3500) {
    const record = this.active.get(id);
    if (!record) {
      this.show(message, type, { id });
      return;
    }

    const { el, timer } = record;
    if (timer) clearTimeout(timer);

    // Update classes and content
    el.className = `toast toast--${type} show`;
    el.querySelector('.toast__icon').textContent = this._iconFor(type);
    el.querySelector('.toast__title').textContent = this._titleFor(type);
    el.querySelector('.toast__message').textContent = message;

    const newTimer = setTimeout(() => this.dismiss(id), duration);
    this.active.get(id).timer = newTimer;
  }

  /**
   * Dismiss a toast by id
   */
  dismiss(id) {
    const record = this.active.get(id);
    if (!record) return;

    const { el, timer } = record;
    if (timer) clearTimeout(timer);

    el.classList.add('hide');
    el.classList.remove('show');

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
      this.active.delete(id);
    }, 400);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.active.forEach((_, id) => this.dismiss(id));
  }

  // Shortcuts
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  loading(message = 'Processing your request…', options = {}) {
    return this.show(message, 'loading', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }
}

// Expose globally
const toast = new ToastManager();