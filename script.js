function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const storedUser = JSON.parse(localStorage.getItem('cyber_registered_user'));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
        const session = {
            username: storedUser.username,
            email: storedUser.email,
            isLoggedIn: true
        };
        localStorage.setItem('cyber_user', JSON.stringify(session));
        window.location.href = 'gen.html';
    } else {
        alert('Invalid email or password credentials.');
    }
}

function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    const newUser = { username, email, password };
    
    localStorage.setItem('cyber_registered_user', JSON.stringify(newUser));
    
    // Auto-login after registration
    const session = { username, email, isLoggedIn: true };
    localStorage.setItem('cyber_user', JSON.stringify(session));
    
    alert('Account created successfully!');
    window.location.href = 'gen.html';
}

// Redirect to studio if session already active
window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('cyber_user'));
    if (session && session.isLoggedIn) {
        window.location.href = 'gen.html';
    }
});
