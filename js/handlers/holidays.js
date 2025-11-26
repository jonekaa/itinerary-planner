import { switchView } from '../ui/views.js';
import { renderItinerary } from '../ui/renderers.js';

// Holiday CRUD operations
export async function createHoliday(e, store) {
    e.preventDefault();
    const input = document.getElementById('new-holiday-name');
    const name = input.value.trim();
    if (!name) return;

    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Creating...';

    try {
        await store.addHoliday(name);
        input.value = '';
        // View will update automatically via listener
    } catch (err) {
        alert('Failed to create holiday: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

export async function deleteHoliday(id, store) {
    if (!confirm('Are you sure you want to delete this holiday? This cannot be undone.')) return;
    try {
        await store.deleteHoliday(id);
    } catch (err) {
        alert('Failed to delete: ' + err.message);
    }
}

export function openHoliday(id, currentHolidays) {
    window.activeHolidayId = id;
    const holiday = currentHolidays.find(h => h.id === id);
    if (!holiday) return;

    renderItinerary(holiday);
    switchView('detail');
}

export function closeHoliday() {
    window.activeHolidayId = null;
    switchView('list');
}
