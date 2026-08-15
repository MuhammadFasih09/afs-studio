window.addEventListener('DOMContentLoaded', () => {
    // Apply Saved Theme Preference
    const settings = JSON.parse(localStorage.getItem('cyber_settings')) || {};
    if (settings.theme === 'light') {
        document.body.classList.add('theme-light');
    }

    // Auto Redirect if already Logged In
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (session && session.isLoggedIn) {
        window.location.href = 'gen.html';
    }
});

function switchTab(type) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const errorMsg = document.getElementById('auth-error');

    errorMsg.classList.add('hidden');

    if (type === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabSignup.classList.add('active');
    }
}

function showError(message) {
    const errorMsg = document.getElementById('auth-error');
    errorMsg.innerText = message;
    errorMsg.classList.remove('hidden');
}

// HANDLE SIGNUP
function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!username || !email || !password) {
        showError('Please fill in all fields.');
        return;
    }

    // Save Registered Credentials in Local Storage
    const userCredentials = { username, email, password };
    localStorage.setItem('cyber_registered_user', JSON.stringify(userCredentials));

    // Auto Login Session Creation
    const sessionData = { username, email, isLoggedIn: true };
    localStorage.setItem('cyber_user', JSON.stringify(sessionData));

    // Redirect to Generation Studio
    window.location.href = 'gen.html';
}

// HANDLE LOGIN
function handleLogin(event) {
    event.preventDefault();
    const usernameOrEmail = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const registeredUser = JSON.parse(localStorage.getItem('cyber_registered_user'));

    if (!registeredUser) {
        showError('No account found. Please sign up first.');
        return;
    }

    // Check credentials against updated password/email from settings
    const isUsernameMatch = usernameOrEmail === registeredUser.username || usernameOrEmail === registeredUser.email;
    const isPasswordMatch = password === registeredUser.password;

    if (isUsernameMatch && isPasswordMatch) {
        const sessionData = {
            username: registeredUser.username,
            email: registeredUser.email,
            isLoggedIn: true
        };
        localStorage.setItem('cyber_user', JSON.stringify(sessionData));
        window.location.href = 'gen.html';
    } else {
        showError('Invalid username/email or password!');
    }
}
