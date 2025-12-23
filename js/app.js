// Main application initialization
import { firebaseConfig } from './config.js';
import { LocalStore } from './stores/LocalStore.js';
import { FirebaseStore } from './stores/FirebaseStore.js';
import { renderHolidayList } from './ui/renderers.js';
import { renderItinerary } from './ui/renderers.js';
import { togglePasswordVisibility } from './ui/login.js';
import { closeHoliday } from './handlers/holidays.js';
import * as authHandlers from './handlers/auth.js';
import * as holidayHandlers from './handlers/holidays.js';
import * as itemHandlers from './handlers/items.js';
import * as exportHandlers from './handlers/export.js';
import * as sharingHandlers from './handlers/sharing.js';

// --- APP INITIALIZATION ---

let store;
let currentHolidays = [];
window.activeHolidayId = null;

// Check if config is provided
const finalConfig = firebaseConfig || (typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null);
const appId = (finalConfig && finalConfig.appId) ? finalConfig.appId : (typeof __app_id !== 'undefined' ? __app_id : 'default-app-id');

if (finalConfig) {
    console.log("Using Firebase Store");
    store = new FirebaseStore(finalConfig, appId);
    document.getElementById('storage-indicator').innerHTML = '<span class="flex items-center gap-1 text-green-600"><i class="ph-fill ph-cloud-check"></i> Cloud Sync Active</span>';
} else {
    console.log("Using Local Store");
    store = new LocalStore();
    document.getElementById('storage-indicator').innerHTML = '<span class="flex items-center gap-1 text-amber-600"><i class="ph-fill ph-hard-drives"></i> Local Mode</span>';
}

// Subscribe to data changes
store.subscribe((holidays) => {
    currentHolidays = holidays;
    renderHolidayList(holidays);

    // If we are viewing a holiday, re-render it to show updates
    if (window.activeHolidayId) {
        const holiday = holidays.find(h => h.id === window.activeHolidayId);
        if (holiday) {
            renderItinerary(holiday);
        } else {
            // Holiday was deleted while viewing
            closeHoliday();
        }
    }
});

// --- EXPOSE HANDLERS TO GLOBAL SCOPE FOR HTML ONCLICK ---

// Auth handlers
window.loginWithGoogle = () => authHandlers.loginWithGoogle(store);
window.handleEmailAuth = (e) => authHandlers.handleEmailAuth(e, store);
window.logout = () => authHandlers.logout(store);
window.togglePasswordVisibility = () => togglePasswordVisibility();

// Holiday handlers
window.createHoliday = (e) => holidayHandlers.createHoliday(e, store);
window.deleteHoliday = (id) => holidayHandlers.deleteHoliday(id, store);
window.openHoliday = (id) => holidayHandlers.openHoliday(id, currentHolidays);
window.closeHoliday = () => holidayHandlers.closeHoliday();

// Item handlers
window.openAddItemModal = (itemId) => itemHandlers.openAddItemModal(itemId, currentHolidays);
window.closeAddItemModal = () => itemHandlers.closeAddItemModal();
window.saveItem = (e) => itemHandlers.saveItem(e, store, currentHolidays);
window.deleteItem = (itemId) => itemHandlers.deleteItem(itemId, store, currentHolidays);

// Export handlers
window.exportPDF = () => exportHandlers.exportPDF(currentHolidays);
window.exportExcel = () => exportHandlers.exportExcel(currentHolidays);

// Sharing handlers
window.openShareModal = (id) => sharingHandlers.openShareModal(id, store, currentHolidays);
window.closeShareModal = () => sharingHandlers.closeShareModal();
window.addCollaborator = (e) => sharingHandlers.addCollaborator(e, store);
window.removeCollaborator = (email) => sharingHandlers.removeCollaborator(email, store);
window.updateCollaboratorRole = (email, role) => sharingHandlers.updateCollaboratorRole(email, role, store);

console.log("Wanderlust app initialized successfully!");
