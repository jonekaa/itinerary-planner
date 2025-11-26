// Navbar update logic
export function updateNavbar(user) {
    const profileEl = document.getElementById('user-profile');
    const nameEl = document.getElementById('user-name');

    if (user) {
        profileEl.classList.remove('hidden');
        profileEl.classList.add('flex');
        nameEl.textContent = user.email || "User";
    } else {
        profileEl.classList.add('hidden');
        profileEl.classList.remove('flex');
        nameEl.textContent = '';
    }
}
