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
        card.className = "group relative bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer ring-1 ring-black/5";
        card.onclick = (e) => {
            if (!e.target.closest('button')) window.openHoliday(holiday.id);
        };

        const itemCount = holiday.itinerary ? holiday.itinerary.length : 0;
        const isGuest = window.currentUser && window.currentUser.isAnonymous;

        let actionsHtml = '';
        if (isGuest) {
            actionsHtml = `
                <button onclick="openHoliday('${holiday.id}')" class="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <i class="ph-bold ph-eye"></i> Open Itinerary
                </button>
            `;
        } else {
            actionsHtml = `
                <button onclick="deleteHoliday('${holiday.id}')" class="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <i class="ph ph-trash"></i> Delete
                </button>
                <button onclick="openHoliday('${holiday.id}')" class="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <i class="ph ph-eye"></i> View
                </button>
            `;
        }

        card.innerHTML = `
            <div class="h-40 bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                <!-- Decorative Pattern -->
                <div class="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                
                <i class="ph-duotone ph-map-trifold text-8xl text-white/20 absolute -bottom-6 -right-6 transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 ease-out"></i>
                
                <div class="relative z-10 px-6 w-full flex flex-col items-center text-center">
                    <h3 class="text-2xl font-bold text-white drop-shadow-md truncate w-full text-pretty leading-tight">${holiday.name}</h3>
                </div>
            </div>
            <div class="p-5">
                <div class="flex justify-between items-center mb-4">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <i class="ph-fill ph-calendar-blank text-slate-400"></i>
                        ${itemCount} Activities
                    </span>
                    <i class="ph-bold ph-arrow-right text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"></i>
                </div>
                <div class="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    ${actionsHtml}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

export function renderItinerary(holiday) {
    const container = document.getElementById('itinerary-timeline');
    container.innerHTML = '';

    const isGuest = window.currentUser && window.currentUser.isAnonymous;
    const isOwner = window.currentUser && window.currentUser.uid === holiday.ownerId;

    // Determine permissions
    let canEdit = isOwner;
    if (isGuest) {
        canEdit = false; // Force false for guests
    } else if (!isOwner && holiday.collaborators) {
        const me = holiday.collaborators.find(c => c.email === window.currentUser.email);
        if (me && me.role === 'editor') canEdit = true;
    }

    document.getElementById('detail-title').textContent = holiday.name;

    // Header Controls (Back button vs Exit button)
    const headerContainer = document.querySelector('#view-detail .bg-white');
    const backBtnContainer = headerContainer.querySelector('.flex.items-center.gap-4');

    if (backBtnContainer) {
        if (isGuest) {
            backBtnContainer.innerHTML = `
                <button onclick="logout()" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500" title="Back to Login">
                    <i class="ph-bold ph-arrow-left text-xl"></i>
                </button>
                <div>
                    <h1 id="detail-title" class="text-2xl font-bold text-slate-900">${holiday.name}</h1>
                    <p class="text-sm text-slate-500 flex items-center gap-1">
                        <i class="ph-fill ph-check-circle text-green-500"></i> Guest View
                    </p>
                </div>
            `;
        } else {
            backBtnContainer.innerHTML = `
                <button onclick="closeHoliday()" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <i class="ph-bold ph-arrow-left text-xl"></i>
                </button>
                <div>
                    <h1 id="detail-title" class="text-2xl font-bold text-slate-900">${holiday.name}</h1>
                    <p class="text-sm text-slate-500 flex items-center gap-1">
                        <i class="ph-fill ph-list-dashes"></i> Itinerary View
                    </p>
                </div>
            `;
        }
    }

    // Action Buttons (Add Activity, Share, Export)
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

    // Export buttons always visible (read-only action)
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

    // "Shared with me" badge
    const existingBadge = headerContainer.querySelector('.shared-badge');
    if (existingBadge) existingBadge.remove();

    if (!isOwner && !isGuest) {
        const badge = document.createElement('div');
        badge.className = "shared-badge mt-2 text-xs text-slate-500 flex items-center gap-1";
        badge.innerHTML = `<i class="ph-fill ph-user-circle"></i> Shared by ${holiday.ownerEmail || 'Owner'}`;
        const desc = headerContainer.querySelector('p.text-sm.text-slate-500');
        if (desc && desc.parentNode) {
            desc.parentNode.insertBefore(badge, desc.nextSibling);
        }
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

    // Group by Date & Sort
    const grouped = {};
    holiday.itinerary.forEach(item => {
        const dateKey = item.date;
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(item);
    });

    const sortedDates = Object.keys(grouped).sort();

    sortedDates.forEach(date => {
        const dayGroup = document.createElement('div');
        dayGroup.className = "mb-12 last:mb-0 relative group/day"; 

        const dateObj = dayjs(date);
        const isToday = dateObj.isSame(dayjs(), 'day');

        // Connector Line (hidden for last item, or handled via absolute height)
        // We'll place it relative to the dayGroup, starting from the header icon down.
        // It needs to connect to the next group, but since we are iterating, we can just draw a long tail 
        // OR simpler: draw a line inside the `space-y-6` container that aligns with the icon.

        dayGroup.innerHTML = `
            <div class="flex items-start gap-4 mb-6 sticky z-20 top-16 bg-slate-50/95 backdrop-blur-sm py-3 z-10 rounded-xl transition-all">
                <div class="flex flex-col items-center justify-center w-14 h-14 rounded-2xl ${isToday ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'} flex-shrink-0 z-20 relative">
                    <span class="text-xs font-bold uppercase tracking-wider">${dateObj.format('MMM')}</span>
                    <span class="text-xl font-black leading-none">${dateObj.format('DD')}</span>
                </div>
                <div class="pt-1.5">
                    <h4 class="text-lg font-bold text-slate-900 leading-tight">${dateObj.format('dddd')}</h4>
                    <p class="text-sm text-slate-500 font-medium">${dateObj.format('MMMM D, YYYY')}</p>
                </div>
            </div>
            
            <!-- Items Container with Connector Line -->
            <div class="relative pl-4 sm:pl-0 ml-7 border-l-2 border-slate-200 space-y-4 pb-2">
                <!-- Items injected here -->
            </div>
        `;

        const itemsContainer = dayGroup.querySelector('.space-y-4');
        const sortedItems = grouped[date].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        sortedItems.forEach(item => {
            const itemEl = document.createElement('div');
            // Added -ml-[17px] to align the card bullet with the border line (grid alignment)
            // Or we use a bubble on the line.
            // Let's keep it simple: Standard cards with a nice margin.
            itemEl.className = "group flex flex-col sm:flex-row gap-3 sm:gap-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all relative ml-6";

            // Visual Bullet on the timeline
            const bullet = document.createElement('div');
            bullet.className = "absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-slate-200 border-2 border-slate-50 group-hover:bg-primary-500 transition-colors z-10";
            itemEl.appendChild(bullet);

            const timeDisplay = item.time ? dayjs(`2000-01-01 ${item.time}`).format('h:mm A') : 'All Day';

            let actionBtns = '';
            if (canEdit) {
                actionBtns = `
                <div class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity absolute top-3 right-3">
                    <button onclick="openAddItemModal('${item.id}')" class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors" title="Edit">
                        <i class="ph-bold ph-pencil-simple"></i>
                    </button>
                    <button onclick="deleteItem('${item.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
                        <i class="ph-bold ph-trash"></i>
                    </button>
                </div>`;
            }

            itemEl.innerHTML += `
                <div class="sm:w-22 flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-2 text-slate-500 font-semibold text-xs sm:text-sm uppercase tracking-wide">
                    <span class="bg-slate-100 px-2 py-1 rounded-md text-slate-600">${timeDisplay}</span>
                </div>
                <div class="flex-grow min-w-0 pr-8">
                    <h5 class="text-base font-bold text-slate-900 truncate">${item.activity}</h5>
                    ${item.location ? `
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 mt-1 transition-colors">
                            <i class="ph-fill ph-map-pin text-primary-500"></i> ${item.location}
                        </a>
                    ` : ''}
                    ${item.notes ? `<p class="text-sm text-slate-600 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100/50">${item.notes}</p>` : ''}
                </div>
                ${actionBtns}
            `;
            itemsContainer.appendChild(itemEl);
        });

        container.appendChild(dayGroup);
    });

    return container;
}
