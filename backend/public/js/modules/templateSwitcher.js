/**
 * CareerForge AI / Resumatic — Template Switcher Module
 * Wrapped in IIFE to prevent global lexical scope collisions.
 */
(function(global) {
  let activeTemplate = 'classic';

  function switchTemplate(targetTemplate, onSwitchComplete) {
    if (targetTemplate === activeTemplate) return;

    const current = document.getElementById(`tpl-${activeTemplate}`);
    const next = document.getElementById(`tpl-${targetTemplate}`);
    const tplButtons = document.querySelectorAll('.tpl-btn');
    const tplNameLabel = document.getElementById('activeTemplateName');

    if (current) {
      current.classList.add('leaving');
      current.classList.remove('active-template');
    }

    if (next) {
      next.style.display = 'block';
      next.classList.add('entering');
      void next.offsetWidth;

      requestAnimationFrame(() => {
        next.classList.remove('entering');
        next.classList.add('active-template');
      });
    }

    setTimeout(() => {
      if (current) {
        current.classList.remove('leaving');
        current.style.display = '';
      }
    }, 380);

    if (tplButtons) {
      tplButtons.forEach(b => b.classList.toggle('active', b.dataset.template === targetTemplate));
    }

    if (tplNameLabel) {
      tplNameLabel.textContent = targetTemplate.charAt(0).toUpperCase() + targetTemplate.slice(1);
    }

    activeTemplate = targetTemplate;

    if (typeof onSwitchComplete === 'function') {
      onSwitchComplete(targetTemplate);
    }
  }

  function initTemplateSwitcher(onSwitchComplete) {
    const tplButtons = document.querySelectorAll('.tpl-btn');
    tplButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tpl = btn.dataset.template;
        switchTemplate(tpl, onSwitchComplete);
      });
    });
  }

  function getActiveTemplate() {
    return activeTemplate;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { switchTemplate, initTemplateSwitcher, getActiveTemplate };
  } else {
    global.switchTemplate = switchTemplate;
    global.initTemplateSwitcher = initTemplateSwitcher;
    global.getActiveTemplate = getActiveTemplate;
  }
})(typeof window !== 'undefined' ? window : this);
