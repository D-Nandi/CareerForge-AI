/**
 * CareerForge AI / Resumatic — Centralized State Store
 * Event-driven state management with Pub/Sub and localStorage auto-persistence.
 * Wrapped in IIFE to prevent global scope collisions.
 */
(function(global) {
  const DEFAULT_STATE = {
    personal: {
      firstName: '',
      lastName: '',
      title: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      summary: ''
    },
    experience: [],
    projects: [],
    education: [],
    skills: {
      tech: [],
      soft: [],
      languages: []
    },
    langProficiency: [],
    activeTemplate: 'classic',
    atsScore: 0,
    targetRole: '',
    jobDescription: ''
  };

  class StateStore {
    constructor() {
      this.listeners = new Map();
      this.state = this.loadInitialState();
    }

    loadInitialState() {
      try {
        const savedRaw = localStorage.getItem('resumatic_state') || localStorage.getItem('resumatic_draft_state');
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          if (parsed && typeof parsed === 'object') {
            const p = parsed.personal || {};
            const jobTitleVal = p.title || p.jobTitle || '';
            return {
              ...DEFAULT_STATE,
              ...parsed,
              personal: {
                ...DEFAULT_STATE.personal,
                ...p,
                title: jobTitleVal,
                jobTitle: jobTitleVal
              }
            };
          }
        }
      } catch (err) {
        console.warn('Failed to load state from localStorage:', err);
      }
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }

    getState() {
      return this.state;
    }

    setState(sliceKey, data) {
      if (sliceKey in this.state) {
        this.state[sliceKey] = data;
      } else {
        this.state = { ...this.state, [sliceKey]: data };
      }
      this.persist();
      this.notify(sliceKey, this.state[sliceKey]);
      this.notify('*', this.state);
    }

    subscribe(key, callback) {
      if (!this.listeners.has(key)) {
        this.listeners.set(key, []);
      }
      this.listeners.get(key).push(callback);

      return () => {
        const list = this.listeners.get(key) || [];
        this.listeners.set(key, list.filter(fn => fn !== callback));
      };
    }

    notify(key, payload) {
      const callbacks = this.listeners.get(key) || [];
      callbacks.forEach(fn => {
        try {
          fn(payload, this.state);
        } catch (err) {
          console.error(`Error in state listener for key "${key}":`, err);
        }
      });
    }

    persist() {
      try {
        const json = JSON.stringify(this.state);
        localStorage.setItem('resumatic_state', json);
        localStorage.setItem('resumatic_draft_state', json);
      } catch (err) {
        console.warn('Failed to persist state:', err);
      }
    }

    reset() {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.persist();
      this.notify('*', this.state);
    }
  }

  const store = new StateStore();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = store;
  } else {
    global.resumaticStore = store;
  }
})(typeof window !== 'undefined' ? window : this);
