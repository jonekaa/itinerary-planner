// Base DataStore class with abstract methods
export class DataStore {
    constructor() {
        this.subscribers = [];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        // Immediately trigger with current data if available
        this.refresh();
    }

    notify(holidays) {
        this.subscribers.forEach(cb => cb(holidays));
    }

    async addHoliday(name) {
        throw new Error("Not implemented");
    }

    async deleteHoliday(id) {
        throw new Error("Not implemented");
    }

    async updateItinerary(holidayId, itinerary) {
        throw new Error("Not implemented");
    }

    refresh() { } // Force refresh data
}
