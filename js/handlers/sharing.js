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

        // Viewer vs Editor check logic for displaying the dropdown (Only owner can see/change this, which is verified in openShareModal)
        // Since the whole modal is owner-only, we can show controls.

        div.innerHTML = `
            <div>
                <p class="text-sm font-medium text-slate-900">${c.email}</p>
                <div class="flex items-center gap-2 mt-1">
                     <select onchange="updateCollaboratorRole('${c.email}', this.value)" class="text-xs bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-600 focus:ring-1 focus:ring-primary-500 outline-none">
                        <option value="viewer" ${c.role === 'viewer' ? 'selected' : ''}>Viewer</option>
                        <option value="editor" ${c.role === 'editor' ? 'selected' : ''}>Editor</option>
                    </select>
                </div>
            </div>
            <button onclick="removeCollaborator('${c.email}')" class="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50" title="Remove User">
                <i class="ph ph-trash"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

export async function updateCollaboratorRole(email, newRole, store) {
    if (!currentSharingHolidayId) return;
    try {
        await store.shareHoliday(currentSharingHolidayId, email, newRole);
        // No need for alert, silent update
    } catch (err) {
        alert("Failed to update role: " + err.message);
    }
}

export async function addCollaborator(e, store) {
    e.preventDefault();
    if (!currentSharingHolidayId) return;

    const emailInput = document.getElementById('share-email-input');
    const roleSelect = document.getElementById('share-role-select');

    const email = emailInput.value.trim().toLowerCase();
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
        // Note: UI updates automatically via listener
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
