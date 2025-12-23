import { generateUUID } from '../utils.js';

// Itinerary item operations
// Itinerary item operations
export function openAddItemModal(itemId = null, currentHolidays = []) {
    const modal = document.getElementById('add-item-modal');
    const form = document.getElementById('add-item-form');
    const title = modal.querySelector('h3');
    const btn = form.querySelector('button[type="submit"]');

    form.reset();

    if (itemId && currentHolidays) {
        // Edit Mode
        const holiday = currentHolidays.find(h => h.id === window.activeHolidayId);
        const item = holiday ? holiday.itinerary.find(i => i.id === itemId) : null;

        if (item) {
            form.dataset.editingId = itemId;
            document.getElementById('item-date').value = item.date;
            document.getElementById('item-time').value = item.time;
            document.getElementById('item-activity').value = item.activity;
            document.getElementById('item-location').value = item.location || '';
            document.getElementById('item-notes').value = item.notes || '';

            title.textContent = 'Edit Activity';
            btn.textContent = 'Update Activity';
        }
    } else {
        // Add Mode
        delete form.dataset.editingId;
        title.textContent = 'Add New Activity';
        btn.textContent = 'Save Activity';
        // Set default date to today 
        document.getElementById('item-date').valueAsDate = new Date();
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    const form = document.getElementById('add-item-form');
    delete form.dataset.editingId; // Cleanup
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function saveItem(e, store, currentHolidays) {
    e.preventDefault();
    if (!window.activeHolidayId) return;

    const holiday = currentHolidays.find(h => h.id === window.activeHolidayId);
    if (!holiday) return;

    const form = e.target;
    const editingId = form.dataset.editingId;

    const itemData = {
        date: document.getElementById('item-date').value,
        time: document.getElementById('item-time').value,
        activity: document.getElementById('item-activity').value.trim(),
        location: document.getElementById('item-location').value.trim(),
        notes: document.getElementById('item-notes').value.trim()
    };

    let newItinerary;

    if (editingId) {
        // Update existing
        newItinerary = holiday.itinerary.map(item => {
            if (item.id === editingId) {
                return { ...item, ...itemData };
            }
            return item;
        });
    } else {
        // Add new
        const newItem = {
            id: generateUUID(),
            ...itemData
        };
        newItinerary = [...(holiday.itinerary || []), newItem];
    }

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
