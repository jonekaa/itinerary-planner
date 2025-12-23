// Authentication handlers
export async function loginWithGoogle(store) {
    try {
        await store.loginWithGoogle();
    } catch (err) {
        alert("Login failed: " + err.message);
    }
}

export async function handleGuestLogin(e, store) {
    e.preventDefault();
    const codeInput = document.getElementById('access-code-input');
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;

    const btn = e.submitter;

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i>';

        await store.loginAsGuest(code);
    } catch (err) {
        alert("Login failed: " + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Go';
        }
    }
}

export async function logout(store) {
    try {
        await store.logout();
    } catch (err) {
        alert("Logout failed: " + err.message);
    }
}
