// Authentication handlers
export async function loginWithGoogle(store) {
    try {
        await store.loginWithGoogle();
    } catch (err) {
        alert("Login failed: " + err.message);
    }
}

export async function handleEmailAuth(e, store) {
    e.preventDefault();
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const action = e.submitter.dataset.action;
    try {
        if (action === 'register') {
            await store.registerWithEmail(email, password);
        } else {
            await store.loginWithEmail(email, password);
        }
    } catch (err) {
        alert("Auth failed: " + err.message);
    }
}

export async function logout(store) {
    try {
        await store.logout();
    } catch (err) {
        alert("Logout failed: " + err.message);
    }
}
