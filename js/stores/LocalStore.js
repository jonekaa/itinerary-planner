import { DataStore } from './DataStore.js';
import { generateUUID } from '../utils.js';

// LocalStorage implementation of DataStore
export class LocalStore extends DataStore {
    constructor() {
        super();
        this.STORAGE_KEY = 'wanderlust_holidays';
    }

    _getHolidays() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    _saveHolidays(holidays) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(holidays));
        this.notify(holidays);
    }

    refresh() {
        this.notify(this._getHolidays());
    }

    async addHoliday(name) {
        const holidays = this._getHolidays();
        const newHoliday = {
            id: generateUUID(),
            name: name,
            createdAt: new Date().toISOString(),
            itinerary: []
        };
        holidays.push(newHoliday);
        this._saveHolidays(holidays);
        return newHoliday.id;
    }

    async deleteHoliday(id) {
        let holidays = this._getHolidays();
        holidays = holidays.filter(h => h.id !== id);
        this._saveHolidays(holidays);
    }

    async updateItinerary(holidayId, itinerary) {
        const holidays = this._getHolidays();
        const holidayIndex = holidays.findIndex(h => h.id === holidayId);
        if (holidayIndex !== -1) {
            holidays[holidayIndex].itinerary = itinerary;
            this._saveHolidays(holidays);
        }
    }
}
