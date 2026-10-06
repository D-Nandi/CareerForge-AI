/**
 * CareerForge AI — Authentication State Manager
 * Exposed globally as `window.auth`
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'cf_user_session';
  let currentUser = null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      currentUser = JSON.parse(raw);
    }
  } catch (e) {
    currentUser = null;
  }

  function isLoggedIn() {
    return Boolean(currentUser && currentUser._id);
  }

  function getUser() {
    return currentUser;
  }

  function setUser(user) {
    currentUser = user;
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  function clearUser() {
    currentUser = null;
    sessionStorage.removeItem(STORAGE_KEY);
  }

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return data.user;
        }
      }
      clearUser();
      return null;
    } catch (e) {
      return currentUser;
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // Continue client cleanup regardless
    }

    try {
      const { auth, signOut } = await import('./firebase-config.js');
      if (auth) await signOut(auth);
    } catch (e) {
      // Non-blocking if Firebase SDK isn't loaded on this page
    }

    clearUser();
    window.location.href = '/login.html';
  }

  // Auto-verify on boot if user is believed to be logged in
  document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
      checkSession();
    }
  });

  window.auth = {
    isLoggedIn,
    getUser,
    setUser,
    clearUser,
    checkSession,
    logout
  };
})();
