/**
 * Template Switcher & Lifecycle Manager
 */

export class TemplateManager {
  constructor(options = {}) {
    this.activeTemplate = options.initialTemplate || 'classic';
    this.onTemplateChange = options.onTemplateChange || (() => {});
    this.tplButtons = document.querySelectorAll('.tpl-btn');
    this.tplNameLabel = document.getElementById('activeTemplateName');
    this.init();
  }

  init() {
    this.tplButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tpl = btn.dataset.template;
        if (tpl === this.activeTemplate) return;
        this.switchTemplate(tpl);
      });
    });
  }

  switchTemplate(tpl) {
    const current = document.getElementById(`tpl-${this.activeTemplate}`);
    const next = document.getElementById(`tpl-${tpl}`);

    if (current && next) {
      current.classList.add('leaving');
      current.classList.remove('active-template');

      next.style.display = 'block';
      next.classList.add('entering');

      void next.offsetWidth;

      requestAnimationFrame(() => {
        next.classList.remove('entering');
        next.classList.add('active-template');
      });

      setTimeout(() => {
        current.classList.remove('leaving');
        current.style.display = '';
      }, 380);
    }

    this.tplButtons.forEach(b => b.classList.toggle('active', b.dataset.template === tpl));
    if (this.tplNameLabel) {
      this.tplNameLabel.textContent = tpl.charAt(0).toUpperCase() + tpl.slice(1);
    }

    this.activeTemplate = tpl;
    this.onTemplateChange(tpl);
  }

  getActiveTemplate() {
    return this.activeTemplate;
  }
}
