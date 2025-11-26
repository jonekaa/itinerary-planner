import { generateUUID } from '../utils.js';

// Itinerary item operations
export function openAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    const form = document.getElementById('add-item-form');
    form.reset();

    // Set default date to today or last used date if possible
    document.getElementById('item-date').valueAsDate = new Date();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function saveItem(e, store, currentHolidays) {
    e.preventDefault();
    if (!window.activeHolidayId) return;

    const holiday = currentHolidays.find(h => h.id === window.activeHolidayId);
    if (!holiday) return;

    const newItem = {
        id: generateUUID(),
        date: document.getElementById('item-date').value,
        time: document.getElementById('item-time').value,
        activity: document.getElementById('item-activity').value.trim(),
        location: document.getElementById('item-location').value.trim(),
        notes: document.getElementById('item-notes').value.trim()
    };

    const newItinerary = [...(holiday.itinerary || []), newItem];

    try {
        await store.updateItinerary(window.activeHolidayId, newItinerary);
        closeAddItemModal();
    } catch (err) {
        alert('Failed to save item: ' + err.message);
    }
}

export async function deleteItem(itemId, store, currentHolidays) {
    if (!window.activeHolidayId) return;
    if (!confirm('Remove this activity?')) return;

    const holiday = currentHolidays.find(h => h.id === window.activeHolidayId);
    const newItinerary = holiday.itinerary.filter(i => i.id !== itemId);

    try {
        await store.updateItinerary(window.activeHolidayId, newItinerary);
    } catch (err) {
        alert('Failed to delete item: ' + err.message);
    }
}
