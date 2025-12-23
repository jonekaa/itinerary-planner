// Authentication handlers
export async function loginWithGoogle(store) {
    try {
        await store.loginWithGoogle();
    } catch (err) {
        alert("Login failed: " + err.message);
    }
}



export async function logout(store) {
    try {
        await store.logout();
    } catch (err) {
        alert("Logout failed: " + err.message);
    }
}
