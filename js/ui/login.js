// Login UI interactions
export function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-input');
    const toggleIcon = document.getElementById('password-toggle-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('ph-eye');
        toggleIcon.classList.add('ph-eye-slash');
        toggleIcon.classList.add('text-primary-600');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('ph-eye-slash');
        toggleIcon.classList.add('ph-eye');
        toggleIcon.classList.remove('text-primary-600');
    }
}
