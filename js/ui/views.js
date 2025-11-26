// View management
export const views = {
    login: document.getElementById('view-login'),
    list: document.getElementById('view-list'),
    detail: document.getElementById('view-detail')
};

export function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
    window.scrollTo(0, 0);
}
