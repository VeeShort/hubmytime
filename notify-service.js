'use strict';

export default class Notify {
  constructor (
    notifyEl,
    timeout,
    defaults,
    options
  ) {
    this.notifyEl = notifyEl;
    this.timeout = timeout;
    this.defaults = {
      delay: 3000,
      text: ''
    };
    this.options = {
      delay: this.defaults.delay
    };
    this.init();
  }

  init() {
    this.notifyEl = document.querySelector('#notify');
  }

  setDelay(ms) {
    this.options.delay = ms >= 0 ? ms : this.defaults.delay;
  }

  error(text) {
    this.showNotify('err', text);
  }

  success(text) {
    this.showNotify('success', text);
  }

  showNotify(className, text) {
    if (this.notifyEl) {
      clearTimeout(this.timeout);
      this.notifyEl.innerText = text ? text.trim() : this.defaults.text;
      this.notifyEl.classList.add('visible', className);
      this.timeout = setTimeout(() => {
        this.notifyEl.classList.remove('visible', className);
      }, this.options.delay);
    }
  }
} 
