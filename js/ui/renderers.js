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

    const currentUserEmail = (window.firebase && window.firebase.auth().currentUser) ? window.firebase.auth().currentUser.email : null;
    // Wait, we don't have direct access to auth here easily without passing it or using global.
    // But since renderHolidayList passes data, we can infer some things, but best to rely on what we have.
    // Actually, `app.js` has `store` but renderers are simple.
    // We can assume if `holiday.ownerId` matches `holiday.ownerId` (which is circular), wait.
    // We need to know 'who am I'.
    // `renderers.js` doesn't know about `store`.

    // Quick fix: Use `firebase.auth().currentUser` if available globally or check `store` if exported (it's not).
    // Better: In `app.js` when calling `renderItinerary`, we might handle this? 
    // Or just look at `holiday.ownerId`. We need to compare it with current user ID.
    // The `store` instance in `app.js` has `userId`.
    // Let's rely on a global variable for currentUserId set in `app.js` or `window.currentUser`.
    // In `app.js` line 54, we have `window.loginWithGoogle`.

    // Let's check `app.js` again. `window.currentUser` isn't set.
    // I should update `app.js` to set `window.currentUser` or similar on auth change.
    // OR, I can rely on the fact that `FirebaseStore` sets `userId`.
    // But `renderers.js` is pure UI.

    // Let's assume `window.currentUser` is available. I will add it to `app.js`.

    const isOwner = window.currentUser && window.currentUser.uid === holiday.ownerId;

    // Determine permissions
    let canEdit = isOwner; // Owners can always edit
    if (!isOwner && holiday.collaborators) {
        const me = holiday.collaborators.find(c => c.email === window.currentUser.email);
        if (me && me.role === 'editor') canEdit = true;
    }

    document.getElementById('detail-title').textContent = holiday.name;

    // Update Header Controls based on permissions
    const headerContainer = document.querySelector('#view-detail .bg-white'); // The header div
    // We need to re-render the buttons section or manipulate it. 
    // Since `renderItinerary` is called every time, we can rebuild the header buttons area.

    // Let's grab the container for buttons
    const btnContainer = headerContainer.querySelector('.flex.flex-wrap.gap-2');

    let buttonsHtml = '';

    if (canEdit) {
        buttonsHtml += `
            <button onclick="openAddItemModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                <i class="ph-bold ph-plus"></i> Add Activity
            </button>
        `;
    }

    if (isOwner) {
        buttonsHtml += `
            <button onclick="openShareModal('${holiday.id}')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 ml-2">
                <i class="ph-bold ph-users"></i> Share
            </button>
        `;
    }

    buttonsHtml += `
        <div class="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
        <button onclick="exportPDF()" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <i class="ph-fill ph-file-pdf text-red-500"></i> PDF
        </button>
        <button onclick="exportExcel()" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <i class="ph-fill ph-file-xls text-green-600"></i> Excel
        </button>
    `;

    btnContainer.innerHTML = buttonsHtml;

    // Add "Shared with me" badge if not owner
    const existingBadge = headerContainer.querySelector('.shared-badge');
    if (existingBadge) existingBadge.remove();

    if (!isOwner) {
        const badge = document.createElement('div');
        badge.className = "shared-badge mt-2 text-xs text-slate-500 flex items-center gap-1";
        badge.innerHTML = `<i class="ph-fill ph-user-circle"></i> Shared by ${holiday.ownerEmail || 'Owner'}`;
        // Insert after description
        const desc = headerContainer.querySelector('p.text-sm.text-slate-500');
        desc.parentNode.insertBefore(badge, desc.nextSibling);
    }


    if (!holiday.itinerary || holiday.itinerary.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <i class="ph ph-list-plus text-4xl text-slate-300 mb-3"></i>
                <p class="text-slate-500">Your itinerary is empty.</p>
                ${canEdit ? `<button onclick="openAddItemModal()" class="mt-4 text-primary-600 font-medium hover:underline">Add your first activity</button>` : ''}
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

            let actionBtns = '';
            if (canEdit) {
                actionBtns = `
                <div class="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 sm:static sm:opacity-100">
                    <button onclick="openAddItemModal('${item.id}')" class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onclick="deleteItem('${item.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>`;
            }

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
                ${actionBtns}
            `;
            itemsContainer.appendChild(itemEl);
        });

        container.appendChild(dayGroup);
    });
}
