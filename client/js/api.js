/**
 * CareerNest — API Client Utility
 * Exposed globally as `window.api`
 */
(function () {
  'use strict';

  class ApiError extends Error {
    constructor(message, status, data) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.data = data;
    }
  }

  async function request(url, options = {}) {
    const config = {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Check for 403 upgrade_required paywall trigger
      if (response.status === 403 && data && (data.error === 'upgrade_required' || data.requiredTier)) {
        if (window.paywall && typeof window.paywall.show === 'function') {
          window.paywall.show({
            feature: data.feature || 'This Feature',
            requiredTier: data.requiredTier || 'pro'
          });
        }
      }

      if (!response.ok) {
        const errorMsg = (data && (data.message || data.error)) || `HTTP ${response.status} Error`;
        throw new ApiError(errorMsg, response.status, data);
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err.message || 'Network error occurred', 0, null);
    }
  }

  window.api = {
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    post: (url, data, options) => request(url, { ...options, method: 'POST', body: data }),
    put: (url, data, options) => request(url, { ...options, method: 'PUT', body: data }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
    request
  };
})();
