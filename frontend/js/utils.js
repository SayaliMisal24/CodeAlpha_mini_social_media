// Apply saved theme immediately, before page renders
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');
// ============================================
// SHARED UTILITIES - used by every page
// ============================================

// The base URL of our backend API - change this if you deploy later
const API_BASE_URL = 'http://localhost:5000/api';

// ----------- TOAST NOTIFICATIONS -----------
// Call showToast("Message", "success") or showToast("Message", "error")
function showToast(message, type = 'success') {
  // Create the toast container if it doesn't exist yet
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create the toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Automatically remove the toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ----------- AUTH TOKEN HELPERS -----------
// Save the JWT token after login/signup
function saveToken(token) {
  localStorage.setItem('token', token);
}

// Get the saved token (used in API request headers)
function getToken() {
  return localStorage.getItem('token');
}

// Save logged-in user's basic info (so we don't re-fetch it every page load)
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Get the saved user info
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Log the user out completely
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Redirect to login if there's no token (used to protect pages like feed/profile)
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

// ----------- SIMPLE EMAIL VALIDATION -----------
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}