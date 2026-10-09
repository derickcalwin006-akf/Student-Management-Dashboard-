/**
 * Student Management System - Login Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  redirectIfLoggedIn();

  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const toggleIcon = document.getElementById('toggleIcon');
  const loginBtn = document.getElementById('loginBtn');
  const loginErrorMsg = document.getElementById('loginErrorMessage');
  const autofillBtn = document.getElementById('btnAutofill');

  // Toggle Password Visibility
  if (togglePasswordBtn && passwordInput && toggleIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      toggleIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      togglePasswordBtn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
    });
  }

  // Quick Autofill Demo Credentials
  if (autofillBtn && usernameInput && passwordInput) {
    autofillBtn.addEventListener('click', () => {
      usernameInput.value = 'admin';
      passwordInput.value = 'admin123';
      usernameInput.classList.remove('is-invalid');
      passwordInput.classList.remove('is-invalid');
      if (loginErrorMsg) loginErrorMsg.classList.remove('visible');
      showToast('Demo credentials filled!', 'info', 2000);
      loginBtn.focus();
    });
  }

  // Handle Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      // Reset states
      usernameInput.classList.remove('is-invalid');
      passwordInput.classList.remove('is-invalid');
      if (loginErrorMsg) loginErrorMsg.classList.remove('visible');

      // Validation
      if (!username) {
        usernameInput.classList.add('is-invalid');
        showToast('Please enter your username.', 'warning');
        usernameInput.focus();
        return;
      }

      if (!password) {
        passwordInput.classList.add('is-invalid');
        showToast('Please enter your password.', 'warning');
        passwordInput.focus();
        return;
      }

      // Check credentials
      const result = loginUser(username, password);

      if (result.success) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
        showToast('Login successful!', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);
      } else {
        // Shake card
        const card = document.querySelector('.login-card');
        if (card) {
          card.classList.remove('shake');
          void card.offsetWidth; // trigger reflow
          card.classList.add('shake');
        }

        usernameInput.classList.add('is-invalid');
        passwordInput.classList.add('is-invalid');

        if (loginErrorMsg) {
          loginErrorMsg.textContent = 'Invalid username or password.';
          loginErrorMsg.classList.add('visible');
        }

        showToast('Invalid username or password.', 'error');
        passwordInput.value = '';
        passwordInput.focus();
      }
    });
  }
});
