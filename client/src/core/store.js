/**
 * Unified Reactive Store for CareerForge AI
 * Centralizes state management, pub/sub change subscriptions,
 * and debounced localStorage synchronization with zero regression.
 */

import { debounce } from '../utils/dom.js';

const STORAGE_KEYS = [
  'careerforge_resume_data',
  'resumatic_resume_data',
  'resumatic_form_data'
];

const DEFAULT_STATE = {
  activeTemplate: 'classic',
  currentStep: 1,
  totalSteps: 6,
  personal: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
  },
  experience: [],
  projects: [],
  education: [],
  skills: {
    tech: [],
    soft: [],
    languages: [],
  },
  langProficiency: [], // [{name, overall, speaking, reading, writing}]
  jobDescription: {
    targetRole: '',
    jobDescription: '',
  },
  tone: 'professional',
};

class ResumeStore {
  constructor() {
    this._state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this._listeners = new Map(); // key -> Set<Function>
    this.init();
  }

  init() {
    this.loadFromStorage();

    // Setup debounced autosave (300ms)
    this._debouncedSave = debounce(() => {
      this.saveToStorage();
    }, 300);

    // Provide global compatibility bridge for existing scripts
    if (typeof window !== 'undefined') {
      window.__resumeStore = this;
      // Allow window.state direct reading/inspection
      window.state = this._state;
    }
  }

  /**
   * Get immutable snapshot or live reference of state
   */
  getState() {
    return this._state;
  }

  /**
   * Update one or more state slices and notify subscribers
   * @param {Object} partialState 
   * @param {boolean} [silent=false] 
   */
  setState(partialState, silent = false) {
    const changedSlices = [];

    for (const [key, value] of Object.entries(partialState)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && this._state[key]) {
        this._state[key] = { ...this._state[key], ...value };
      } else {
        this._state[key] = value;
      }
      changedSlices.push(key);
    }

    if (!silent) {
      changedSlices.forEach(slice => this._notify(slice));
      this._notify('*');
    }

    this._debouncedSave();
  }

  /**
   * Update a specific personal detail field (fine-grained)
   * @param {string} field 
   * @param {string} value 
   */
  updatePersonal(field, value) {
    if (this._state.personal[field] === value) return;
    this._state.personal[field] = value;
    this._notify('personal');
    this._notify(`personal.${field}`);
    this._debouncedSave();
  }

  /**
   * Subscribe to state slice changes
   * @param {string} sliceName e.g. 'personal', 'experience', 'skills', or '*'
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  subscribe(sliceName, callback) {
    if (!this._listeners.has(sliceName)) {
      this._listeners.set(sliceName, new Set());
    }
    this._listeners.get(sliceName).add(callback);

    return () => {
      const set = this._listeners.get(sliceName);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this._listeners.delete(sliceName);
      }
    };
  }

  _notify(sliceName) {
    const set = this._listeners.get(sliceName);
    if (set) {
      set.forEach(cb => {
        try {
          cb(this._state[sliceName], this._state);
        } catch (err) {
          console.error(`Error in subscriber for ${sliceName}:`, err);
        }
      });
    }
  }

  /**
   * Save current state into local storage across all fallback keys
   */
  saveToStorage() {
    try {
      const payload = JSON.stringify(this._state);
      STORAGE_KEYS.forEach(key => {
        localStorage.setItem(key, payload);
      });
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  /**
   * Hydrate state from local storage
   */
  loadFromStorage() {
    for (const key of STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            this._state = {
              ...this._state,
              ...parsed,
              personal: { ...this._state.personal, ...(parsed.personal || {}) },
              skills: { ...this._state.skills, ...(parsed.skills || {}) },
            };
            return true;
          }
        }
      } catch (e) {
        console.warn(`Could not parse storage key ${key}:`, e);
      }
    }
    return false;
  }
}

export const store = new ResumeStore();
