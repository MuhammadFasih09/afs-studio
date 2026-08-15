// Tab Switching
function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');

    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
    }
}

// Auth Handler
function handleAuth(event, type) {
    event.preventDefault();
    
    let username, email;
    if (type === 'signup') {
        username = document.getElementById('signup-name').value;
        email = document.getElementById('signup-email').value;
    } else {
        email = document.getElementById('login-email').value;
        username = email.split('@')[0];
    }

    // Save Session Data in localStorage
    const userSession = {
        username: username,
        email: email,
        isLoggedIn: true
    };

    localStorage.setItem('cyber_user', JSON.stringify(userSession));

    // Redirect to Main Generator Page
    window.location.href = 'gen.html';
}

// Auto Redirect if logged in
window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (session && session.isLoggedIn) {
        window.location.href = 'gen.html';
    }
});
