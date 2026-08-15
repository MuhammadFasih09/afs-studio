const authForm = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const nameGroup = document.getElementById('name-group');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authBtn = document.getElementById('auth-btn');
const switchMsg = document.getElementById('switch-msg');
const switchLink = document.getElementById('switch-link');

let isSignup = false;

// Toggle between Login and Signup mode
switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignup = !isSignup;
    if (isSignup) {
        formTitle.textContent = 'Create Account';
        nameGroup.style.display = 'block';
        nameInput.setAttribute('required', 'true');
        authBtn.textContent = 'Sign Up';
        switchMsg.textContent = 'Already have an account?';
        switchLink.textContent = 'Login';
    } else {
        formTitle.textContent = 'Welcome Back';
        nameGroup.style.display = 'none';
        nameInput.removeAttribute('required');
        authBtn.textContent = 'Login';
        switchMsg.textContent = "Don't have an account?";
        switchLink.textContent = 'Sign Up';
    }
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (isSignup) {
        const name = nameInput.value.trim();
        const userData = { name, email, password };
        localStorage.setItem('ai_user', JSON.stringify(userData));
        
        // Initialize default user settings and empty history
        localStorage.setItem('ai_theme', 'dark');
        localStorage.setItem('ai_history', JSON.stringify([]));
        
        alert('Account created successfully! Please login.');
        switchLink.click();
    } else {
        const storedUser = JSON.parse(localStorage.getItem('ai_user'));
        if (storedUser && storedUser.email === email && storedUser.password === password) {
            localStorage.setItem('ai_logged_in', 'true');
            window.location.href = 'gen.html';
        } else {
            alert('Invalid email or password! Please check or sign up first.');
        }
    }
});

// Redirect if already logged in
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('ai_logged_in') === 'true') {
        window.location.href = 'gen.html';
    }
});
