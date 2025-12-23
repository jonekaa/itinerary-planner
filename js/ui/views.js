// View management

export function switchView(viewName) {
    // Look up elements lazily to avoid initialization race conditions
    const views = {
        login: document.getElementById('view-login'),
        list: document.getElementById('view-list'),
        detail: document.getElementById('view-detail'),
        loading: document.getElementById('view-loading')
    };

    Object.values(views).forEach(el => {
        if (el) el.classList.add('hidden');
    });

    if (views[viewName]) {
        views[viewName].classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        console.error(`View '${viewName}' not found`);
    }
}
