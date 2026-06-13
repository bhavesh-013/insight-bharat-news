/**
 * Auth JavaScript Module - Insight Samachar
 * Handles login, registration, validation, and session states.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Update date in headers
  updateHeaderDate();

  // Elements
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const errorBanner = document.getElementById('auth-error-banner');
  const errorMessage = document.getElementById('error-message');

  // Password Visibility Toggle
  setupPasswordToggles();

  // Form Handling
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Google Login & Guest Login
  const googleBtn = document.getElementById('google-login-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleLogin);
  }

  const guestBtn = document.getElementById('guest-btn');
  if (guestBtn) {
    guestBtn.addEventListener('click', handleGuestLogin);
  }
});

/**
 * Format and insert current date into the auth cards
 */
function updateHeaderDate() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', options);
  }
}

/**
 * Toggles input types between password and text
 */
function setupPasswordToggles() {
  const toggles = [
    { btnId: 'password-toggle', inputId: 'password', iconId: 'toggle-icon' },
    { btnId: 'confirm-password-toggle', inputId: 'confirm-password', iconId: 'confirm-toggle-icon' }
  ];

  toggles.forEach(t => {
    const btn = document.getElementById(t.btnId);
    const input = document.getElementById(t.inputId);
    const icon = document.getElementById(t.iconId);

    if (btn && input && icon) {
      btn.addEventListener('click', () => {
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'ri-eye-line';
        } else {
          input.type = 'password';
          icon.className = 'ri-eye-off-line';
        }
      });
    }
  });
}

/**
 * Handle user Login
 */
function handleLogin(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMe = document.getElementById('remember-me').checked;

  const emailVal = emailInput.value.trim();
  const passwordVal = passwordInput.value;

  let isValid = true;

  // Validate Email
  if (!validateEmail(emailVal)) {
    showInputError(emailInput, 'email-error');
    isValid = false;
  } else {
    hideInputError(emailInput, 'email-error');
  }

  // Validate Password
  if (passwordVal.length < 6) {
    showInputError(passwordInput, 'password-error');
    isValid = false;
  } else {
    hideInputError(passwordInput, 'password-error');
  }

  if (!isValid) return;

  // Authenticate user against LocalStorage database
  const users = JSON.parse(localStorage.getItem('insight_samachar_users') || '[]');
  const matchedUser = users.find(u => u.email.toLowerCase() === emailVal.toLowerCase() && u.password === passwordVal);

  if (matchedUser) {
    // Save state
    const session = {
      isLoggedIn: true,
      user: {
        name: matchedUser.name,
        email: matchedUser.email,
        country: matchedUser.country,
        avatar: null
      },
      type: 'user'
    };
    
    if (rememberMe) {
      localStorage.setItem('insight_samachar_session', JSON.stringify(session));
    } else {
      sessionStorage.setItem('insight_samachar_session', JSON.stringify(session));
    }
    
    // Redirect to Home
    window.location.href = 'index.html';
  } else {
    // Also support default admin credential for testing out-of-the-box
    if (emailVal.toLowerCase() === 'editor@insightsamachar.com' && passwordVal === 'editor123') {
      const defaultSession = {
        isLoggedIn: true,
        user: {
          name: "Chief Editor",
          email: "editor@insightsamachar.com",
          country: "IN",
          avatar: null
        },
        type: 'user'
      };
      
      if (rememberMe) {
        localStorage.setItem('insight_samachar_session', JSON.stringify(defaultSession));
      } else {
        sessionStorage.setItem('insight_samachar_session', JSON.stringify(defaultSession));
      }
      window.location.href = 'index.html';
    } else {
      showAuthError('Invalid credentials. Double check your email or password, or Register below.');
    }
  }
}

/**
 * Handle user Registration/Signup
 */
function handleSignup(e) {
  e.preventDefault();

  const nameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const countrySelect = document.getElementById('country');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const termsInput = document.getElementById('agree-terms');

  let isValid = true;

  // Name check
  if (nameInput.value.trim() === '') {
    showInputError(nameInput, 'fullname-error');
    isValid = false;
  } else {
    hideInputError(nameInput, 'fullname-error');
  }

  // Email check
  if (!validateEmail(emailInput.value.trim())) {
    showInputError(emailInput, 'email-error');
    isValid = false;
  } else {
    hideInputError(emailInput, 'email-error');
  }

  // Country check
  if (countrySelect.value === '') {
    showInputError(countrySelect, 'country-error');
    isValid = false;
  } else {
    hideInputError(countrySelect, 'country-error');
  }

  // Password length
  if (passwordInput.value.length < 6) {
    showInputError(passwordInput, 'password-error');
    isValid = false;
  } else {
    hideInputError(passwordInput, 'password-error');
  }

  // Password matching
  if (confirmInput.value !== passwordInput.value || confirmInput.value === '') {
    showInputError(confirmInput, 'confirm-password-error');
    isValid = false;
  } else {
    hideInputError(confirmInput, 'confirm-password-error');
  }

  // Terms checkbox
  if (!termsInput.checked) {
    document.getElementById('terms-error').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('terms-error').style.display = 'none';
  }

  if (!isValid) return;

  // Register user into LocalStorage list
  const users = JSON.parse(localStorage.getItem('insight_samachar_users') || '[]');
  
  // Check duplication
  const duplicate = users.find(u => u.email.toLowerCase() === emailInput.value.trim().toLowerCase());
  if (duplicate) {
    showAuthError('A subscriber with this email address already exists.');
    return;
  }

  const newUser = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    country: countrySelect.value,
    password: passwordInput.value,
    joined: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('insight_samachar_users', JSON.stringify(users));

  // Redirect to login page
  window.location.href = 'login.html';
}

/**
 * Handle Guest read bypass
 */
function handleGuestLogin(e) {
  const session = {
    isLoggedIn: true,
    user: {
      name: "Guest Reader",
      email: "guest@insightsamachar.com",
      country: "IN",
      avatar: null
    },
    type: 'guest'
  };
  sessionStorage.setItem('insight_samachar_session', JSON.stringify(session));
}

/**
 * Mock Google Sign In
 */
function handleGoogleLogin(e) {
  e.preventDefault();
  const session = {
    isLoggedIn: true,
    user: {
      name: "Google Reader",
      email: "google.reader@gmail.com",
      country: "IN",
      avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c"
    },
    type: 'user'
  };
  localStorage.setItem('insight_samachar_session', JSON.stringify(session));
  window.location.href = 'index.html';
}

/* Helpers */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showInputError(inputEl, errorId) {
  inputEl.classList.add('error');
  const errorText = document.getElementById(errorId);
  if (errorText) errorText.style.display = 'block';
}

function hideInputError(inputEl, errorId) {
  inputEl.classList.remove('error');
  const errorText = document.getElementById(errorId);
  if (errorText) errorText.style.display = 'none';
}

function showAuthError(msg) {
  const banner = document.getElementById('auth-error-banner');
  const messageEl = document.getElementById('error-message');
  if (banner && messageEl) {
    messageEl.textContent = msg;
    banner.style.display = 'flex';
  }
}