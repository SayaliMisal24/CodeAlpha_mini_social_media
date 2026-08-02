// ============================================
// SIGNUP PAGE LOGIC
// ============================================

const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  document.getElementById('emailError').classList.remove('active');
  document.getElementById('passwordError').classList.remove('active');

  if (!isValidEmail(email)) {
    document.getElementById('emailError').classList.add('active');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById('passwordError').classList.add('active');
    return;
  }

  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating account...';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || 'Signup failed', 'error');
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
      return;
    }

    saveToken(data.token);
    saveUser(data.user);
    showToast('Account created successfully!', 'success');

    setTimeout(() => {
      window.location.href = 'feed.html';
    }, 1000);
  } catch (error) {
    showToast('Could not connect to server. Is your backend running?', 'error');
    signupBtn.disabled = false;
    signupBtn.textContent = 'Sign Up';
  }
});