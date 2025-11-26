// UI Rendering functions
export function renderHolidayList(holidays) {
    const container = document.getElementById('holiday-grid');
    container.innerHTML = '';

    if (holidays.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <i class="ph ph-airplane-tilt text-3xl text-slate-400"></i>
                </div>
                <h3 class="text-lg font-medium text-slate-900">No trips planned yet</h3>
                <p class="mt-1 text-slate-500">Start your adventure by creating a new holiday.</p>
            </div>
        `;
        return;
    }

    // Sort by creation date (newest first) if available, or name
    const sorted = [...holidays].sort((a, b) => {
        return (b.createdAt || '').localeCompare(a.createdAt || '') || a.name.localeCompare(b.name);
    });

    sorted.forEach(holiday => {
        const card = document.createElement('div');
        card.className = "group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 overflow-hidden cursor-pointer";
        card.onclick = (e) => {
            if (!e.target.closest('button')) window.openHoliday(holiday.id);
        };

        const itemCount = holiday.itinerary ? holiday.itinerary.length : 0;

        card.innerHTML = `
            <div class="h-32 bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                <i class="ph-fill ph-map-trifold text-6xl text-white/20 absolute -bottom-4 -right-4 transform rotate-12"></i>
                <h3 class="text-2xl font-bold text-white relative z-10 px-6 text-center drop-shadow-sm truncate w-full text-pretty">${holiday.name}</h3>
            </div>
            <div class="p-5">
                <div class="flex justify-between items-center mb-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <i class="ph-fill ph-calendar-blank"></i>
                        ${itemCount} Activities
                    </span>
                </div>
                <div class="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button onclick="deleteHoliday('${holiday.id}')" class="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <i class="ph ph-trash"></i> Delete
                    </button>
                    <button onclick="openHoliday('${holiday.id}')" class="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <i class="ph ph-eye"></i> View
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

export function renderItinerary(holiday) {
    const container = document.getElementById('itinerary-timeline');
    container.innerHTML = '';

    document.getElementById('detail-title').textContent = holiday.name;

    if (!holiday.itinerary || holiday.itinerary.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <i class="ph ph-list-plus text-4xl text-slate-300 mb-3"></i>
                <p class="text-slate-500">Your itinerary is empty.</p>
                <button onclick="openAddItemModal()" class="mt-4 text-primary-600 font-medium hover:underline">Add your first activity</button>
            </div>
        `;
        return;
    }

    // Group by Date
    const grouped = {};
    holiday.itinerary.forEach(item => {
        const dateKey = item.date;
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(item);
    });

    // Sort Dates
    const sortedDates = Object.keys(grouped).sort();

    sortedDates.forEach(date => {
        const dayGroup = document.createElement('div');
        dayGroup.className = "mb-8 last:mb-0";

        const dateObj = dayjs(date);
        const isToday = dateObj.isSame(dayjs(), 'day');

        dayGroup.innerHTML = `
            <div class="flex items-center gap-4 mb-4 sticky top-0 bg-slate-50 py-2 z-10">
                <div class="flex flex-col items-center justify-center w-14 h-14 rounded-xl ${isToday ? 'bg-primary-600 text-white shadow-primary-200 shadow-lg' : 'bg-white border border-slate-200 text-slate-700'} shadow-sm flex-shrink-0">
                    <span class="text-xs font-medium uppercase">${dateObj.format('MMM')}</span>
                    <span class="text-xl font-bold leading-none">${dateObj.format('DD')}</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-slate-900">${dateObj.format('dddd')}</h4>
                    <p class="text-sm text-slate-500">${dateObj.format('MMMM D, YYYY')}</p>
                </div>
                <div class="h-px bg-slate-200 flex-grow ml-4"></div>
            </div>
            <div class="space-y-3 pl-4 sm:pl-0">
            </div>
        `;

        const itemsContainer = dayGroup.querySelector('.space-y-3');

        // Sort items by time
        const sortedItems = grouped[date].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        sortedItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = "group flex flex-col sm:flex-row gap-3 sm:gap-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all relative";

            const timeDisplay = item.time ? dayjs(`2000-01-01 ${item.time}`).format('h:mm A') : 'All Day';

            itemEl.innerHTML = `
                <div class="sm:w-24 flex-shrink-0 flex items-center gap-2 text-slate-500 font-medium text-sm">
                    <i class="ph ph-clock"></i>
                    ${timeDisplay}
                </div>
                <div class="flex-grow min-w-0">
                    <h5 class="text-base font-semibold text-slate-900 truncate">${item.activity}</h5>
                    ${item.location ? `
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}" target="_blank" class="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-1">
                            <i class="ph-fill ph-map-pin"></i> ${item.location}
                        </a>
                    ` : ''}
                    ${item.notes ? `<p class="text-sm text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg">${item.notes}</p>` : ''}
                </div>
                <div class="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 sm:static sm:opacity-100">
                    <button onclick="deleteItem('${item.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            `;
            itemsContainer.appendChild(itemEl);
        });

        container.appendChild(dayGroup);
    });
}
