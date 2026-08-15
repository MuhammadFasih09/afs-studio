// 4. Update Profile Credentials & Password (ENHANCED LOGIN-SYNC FIX)
function saveProfile(event) {
    if (event) event.preventDefault();

    let session = JSON.parse(localStorage.getItem('cyber_user')) || {};
    
    // Save previous records before updating session
    const oldEmail = (session.email || '').toLowerCase().trim();
    const oldUsername = (session.username || '').toLowerCase().trim();

    const newUsernameInput = document.getElementById('set-username')?.value.trim();
    const newEmailInput = document.getElementById('set-email')?.value.trim();
    const newPassword = document.getElementById('set-password')?.value.trim();
    const confirmPassword = document.getElementById('set-confirm-password')?.value.trim();

    if (!newUsernameInput || !newEmailInput) {
        alert('Username aur Email required hain!');
        return;
    }

    // Password Validation Check
    let updatePassword = false;
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            alert('New Password aur Confirm Password match nahi kar rahay!');
            return;
        }
        if (newPassword.length < 4) {
            alert('Password kam se kam 4 characters ka hona chahiye!');
            return;
        }
        updatePassword = true;
    }

    // Determine target password
    const finalPassword = updatePassword ? newPassword : (session.password || '');

    // 1. Update Session Object
    session.username = newUsernameInput;
    session.email = newEmailInput;
    if (updatePassword) {
        session.password = finalPassword;
    }
    localStorage.setItem('cyber_user', JSON.stringify(session));

    // 2. Update Global Registered Users Array ('cyber_users')
    let allUsers = JSON.parse(localStorage.getItem('cyber_users')) || [];

    // Look for matching user in allUsers database
    let userIndex = allUsers.findIndex(u => {
        const uEmail = (u.email || '').toLowerCase().trim();
        const uUser = (u.username || u.name || '').toLowerCase().trim();
        return (oldEmail && uEmail === oldEmail) || 
               (oldUsername && uUser === oldUsername) || 
               (uEmail === newEmailInput.toLowerCase()) || 
               (uUser === newUsernameInput.toLowerCase());
    });

    if (userIndex !== -1) {
        // Existing user updated
        allUsers[userIndex].username = newUsernameInput;
        allUsers[userIndex].email = newEmailInput;
        allUsers[userIndex].password = finalPassword;
    } else {
        // If not found in database, push new account
        allUsers.push({
            username: newUsernameInput,
            email: newEmailInput,
            password: finalPassword
        });
    }

    // Save updated users list back to localStorage
    localStorage.setItem('cyber_users', JSON.stringify(allUsers));

    // Clear Password Inputs
    if (document.getElementById('set-password')) document.getElementById('set-password').value = '';
    if (document.getElementById('set-confirm-password')) document.getElementById('set-confirm-password').value = '';

    alert('Profile & Password successfully update ho gaya hai! Ab aap naye password se login kar sakte hain.');
}
