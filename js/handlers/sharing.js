// Sharing logic handlers
let currentSharingHolidayId = null;

export async function openShareModal(holidayId, store, currentHolidays) {
    const holiday = currentHolidays.find(h => h.id === holidayId);
    if (!holiday) return;

    // Security check: Only owner can share
    if (holiday.ownerId !== store.userId) {
        alert("Only the owner can manage collaborators.");
        return;
    }

    currentSharingHolidayId = holidayId;
    const modal = document.getElementById('share-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Populate current collaborators
    renderCollaboratorsList(holiday);
}

export function closeShareModal() {
    const modal = document.getElementById('share-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentSharingHolidayId = null;
    document.getElementById('share-email-input').value = '';
}

function renderCollaboratorsList(holiday) {
    const container = document.getElementById('collaborators-list');
    container.innerHTML = '';

    const collaborators = holiday.collaborators || [];

    if (collaborators.length === 0) {
        container.innerHTML = '<p class="text-sm text-slate-500 italic">No collaborators yet.</p>';
        return;
    }

    collaborators.forEach(c => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200";
        div.innerHTML = `
            <div>
                <p class="text-sm font-medium text-slate-900">${c.email}</p>
                <span class="text-xs text-slate-500 uppercase tracking-wider">${c.role}</span>
            </div>
            <button onclick="removeCollaborator('${c.email}')" class="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50">
                <i class="ph ph-trash"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

export async function addCollaborator(e, store) {
    e.preventDefault();
    if (!currentSharingHolidayId) return;

    const emailInput = document.getElementById('share-email-input');
    const roleSelect = document.getElementById('share-role-select');

    const email = emailInput.value.trim();
    const role = roleSelect.value;

    if (!email) return;

    const btn = e.submitter;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Adding...';

    try {
        await store.shareHoliday(currentSharingHolidayId, email, role);
        emailInput.value = '';

        // Refresh list
        // Note: The UI updates automatically via the snapshot listener in store
        // But we might want to refresh the modal specifically if the snapshot doesn't trigger a full re-render of the modal
        // Since the modal is just reading from 'currentHolidays' which is updated, 
        // we might need to rely on the re-render or manually re-fetch.
        // For now, let's just close modal or wait for update?
        // Better: We can rely on the fact that store.onSnapshot will trigger app.js subscription
        // which updates currentHolidays. We just need to re-render the list inside the modal if it's open.
        // However, we don't have direct access to the latest holiday object here instantly unless we wait.

    } catch (err) {
        alert("Failed to add collaborator: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

export async function removeCollaborator(email, store) {
    if (!currentSharingHolidayId) return;
    if (!confirm(`Remove access for ${email}?`)) return;

    try {
        await store.removeCollaborator(currentSharingHolidayId, email);
    } catch (err) {
        alert("Failed to remove: " + err.message);
    }
}
