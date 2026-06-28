requireAuth();

let editingId = null;
let deletingId = null;

// ── CARGAR CERTIFICACIONES ────────────────────────────────────
async function loadCertifications() {
    const tbody = document.getElementById('certificationsTable');

    try {
        const res = await authFetch(`${API}/certifications/`);
        const certifications = await res.json();

        if (certifications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        No hay certificaciones todavía
                        <p>Hacé clic en "Nueva certificación" para agregar una</p>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = certifications.map(c => `
            <tr>
                <td>${c.name}</td>
                <td style="color:var(--text-muted); font-size:0.85rem">${c.issuer}</td>
                <td style="font-size:0.85rem">${formatDate(c.date)}</td>
                <td>${c.order}</td>
                <td style="display:flex; gap:0.5rem">
                    <button class="btn btn-secondary" onclick="openModal(${c.id})">Editar</button>
                    <button class="btn btn-danger" onclick="openDelete(${c.id}, '${c.name.replace(/'/g, "\\'")}')">Eliminar</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Error al cargar certificaciones</td></tr>`;
    }
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// ── MODAL CREAR / EDITAR ──────────────────────────────────────
async function openModal(id = null) {
    editingId = id;
    clearForm();

    document.getElementById('modalTitle').textContent = id ? 'Editar certificación' : 'Nueva certificación';
    document.getElementById('modalOverlay').classList.add('show');

    if (id) {
        const res = await authFetch(`${API}/certifications/${id}/`);
        const c = await res.json();

        document.getElementById('fieldName').value = c.name;
        document.getElementById('fieldIssuer').value = c.issuer;
        document.getElementById('fieldDate').value = c.date;
        document.getElementById('fieldCredentialUrl').value = c.credential_url || '';
        document.getElementById('fieldOrder').value = c.order;
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    editingId = null;
    clearForm();
}

function clearForm() {
    ['fieldName', 'fieldIssuer', 'fieldDate', 'fieldCredentialUrl', 'fieldOrder'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('fieldImage').value = '';
}

// ── GUARDAR ───────────────────────────────────────────────────
async function saveCertification() {
    const name = document.getElementById('fieldName').value.trim();
    const issuer = document.getElementById('fieldIssuer').value.trim();
    const date = document.getElementById('fieldDate').value;

    if (!name || !issuer || !date) {
        showAlert('modalAlert', 'Nombre, emisor y fecha son obligatorios');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('issuer', issuer);
    formData.append('date', date);
    formData.append('credential_url', document.getElementById('fieldCredentialUrl').value.trim());
    formData.append('order', document.getElementById('fieldOrder').value || 0);

    const imageFile = document.getElementById('fieldImage').files[0];
    if (imageFile) formData.append('image', imageFile);

    const btn = document.getElementById('saveBtn');
    btn.textContent = 'Guardando...';
    btn.disabled = true;

    try {
        const url = editingId
            ? `${API}/certifications/${editingId}/`
            : `${API}/certifications/`;

        const method = editingId ? 'PUT' : 'POST';

        const res = await authFetch(url, { method, body: formData });

        if (!res.ok) {
            showAlert('modalAlert', 'Error al guardar la certificación');
            return;
        }

        closeModal();
        showAlert('alert', editingId ? 'Certificación actualizada' : 'Certificación creada', 'success');
        loadCertifications();

    } catch (err) {
        showAlert('modalAlert', 'Error al conectar con el servidor');
    } finally {
        btn.textContent = 'Guardar';
        btn.disabled = false;
    }
}

// ── ELIMINAR ──────────────────────────────────────────────────
function openDelete(id, name) {
    deletingId = id;
    document.getElementById('deleteCertName').textContent = name;
    document.getElementById('deleteOverlay').classList.add('show');
}

function closeDelete() {
    document.getElementById('deleteOverlay').classList.remove('show');
    deletingId = null;
}

async function confirmDelete() {
    if (!deletingId) return;

    try {
        await authFetch(`${API}/certifications/${deletingId}/`, { method: 'DELETE' });
        closeDelete();
        showAlert('alert', 'Certificación eliminada', 'success');
        loadCertifications();
    } catch (err) {
        showAlert('alert', 'Error al eliminar la certificación');
    }
}

// ── INIT ──────────────────────────────────────────────────────
loadCertifications();