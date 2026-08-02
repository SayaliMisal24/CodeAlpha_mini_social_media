// ============================================
// LOGIN PAGE LOGIC
// ============================================

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || 'Login failed', 'error');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log In';
      return;
    }

    saveToken(data.token);
    saveUser(data.user);
    showToast('Login successful!', 'success');

    setTimeout(() => {
      window.location.href = 'feed.html';
    }, 800);
  } catch (error) {
    showToast('Could not connect to server. Is your backend running?', 'error');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
  }
});