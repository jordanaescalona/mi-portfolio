requireAuth();

let editingId = null;
let deletingId = null;

// ── CARGAR PROYECTOS ──────────────────────────────────────────
async function loadProjects() {
    const tbody = document.getElementById('projectsTable');

    try {
        const res = await authFetch(`${API}/projects/`);
        const projects = await res.json();

        if (projects.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        No hay proyectos todavía
                        <p>Hacé clic en "Nuevo proyecto" para agregar uno</p>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = projects.map(p => `
            <tr>
                <td>${p.title}</td>
                <td style="color:var(--text-muted); font-size:0.85rem">${p.technologies}</td>
                <td>
                    <span class="badge ${p.featured ? 'badge-success' : 'badge-muted'}">
                        ${p.featured ? 'Sí' : 'No'}
                    </span>
                </td>
                <td>${p.order}</td>
                <td style="display:flex; gap:0.5rem">
                    <button class="btn btn-secondary" onclick="openModal(${p.id})">Editar</button>
                    <button class="btn btn-danger" onclick="openDelete(${p.id}, '${p.title.replace(/'/g, "\\'")}')">Eliminar</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Error al cargar proyectos</td></tr>`;
    }
}

// ── MODAL CREAR / EDITAR ──────────────────────────────────────
async function openModal(id = null) {
    editingId = id;
    clearForm();

    document.getElementById('modalTitle').textContent = id ? 'Editar proyecto' : 'Nuevo proyecto';
    document.getElementById('modalOverlay').classList.add('show');

    if (id) {
        const res = await authFetch(`${API}/projects/${id}/`);
        const p = await res.json();

        document.getElementById('fieldTitle').value = p.title;
        document.getElementById('fieldDescription').value = p.description;
        document.getElementById('fieldTechnologies').value = p.technologies;
        document.getElementById('fieldRepoUrl').value = p.repo_url || '';
        document.getElementById('fieldDemoUrl').value = p.demo_url || '';
        document.getElementById('fieldFeatured').checked = p.featured;
        document.getElementById('fieldOrder').value = p.order;
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    editingId = null;
    clearForm();
}

function clearForm() {
    ['fieldTitle', 'fieldDescription', 'fieldTechnologies',
     'fieldRepoUrl', 'fieldDemoUrl', 'fieldOrder'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('fieldFeatured').checked = false;
    document.getElementById('fieldImage').value = '';
}

// ── GUARDAR (crear o editar) ──────────────────────────────────
async function saveProject() {
    const title = document.getElementById('fieldTitle').value.trim();
    const description = document.getElementById('fieldDescription').value.trim();
    const technologies = document.getElementById('fieldTechnologies').value.trim();

    if (!title || !description || !technologies) {
        showAlert('modalAlert', 'Título, descripción y tecnologías son obligatorios');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('technologies', technologies);
    formData.append('repo_url', document.getElementById('fieldRepoUrl').value.trim());
    formData.append('demo_url', document.getElementById('fieldDemoUrl').value.trim());
    formData.append('featured', document.getElementById('fieldFeatured').checked);
    formData.append('order', document.getElementById('fieldOrder').value || 0);

    const imageFile = document.getElementById('fieldImage').files[0];
    if (imageFile) formData.append('image', imageFile);

    const btn = document.getElementById('saveBtn');
    btn.textContent = 'Guardando...';
    btn.disabled = true;

    try {
        const url = editingId
            ? `${API}/projects/${editingId}/`
            : `${API}/projects/`;

        const method = editingId ? 'PUT' : 'POST';

        const res = await authFetch(url, { method, body: formData });

        if (!res.ok) {
            showAlert('modalAlert', 'Error al guardar el proyecto');
            return;
        }

        closeModal();
        showAlert('alert', editingId ? 'Proyecto actualizado' : 'Proyecto creado', 'success');
        loadProjects();

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
    document.getElementById('deleteProjectName').textContent = name;
    document.getElementById('deleteOverlay').classList.add('show');
}

function closeDelete() {
    document.getElementById('deleteOverlay').classList.remove('show');
    deletingId = null;
}

async function confirmDelete() {
    if (!deletingId) return;

    try {
        await authFetch(`${API}/projects/${deletingId}/`, { method: 'DELETE' });
        closeDelete();
        showAlert('alert', 'Proyecto eliminado', 'success');
        loadProjects();
    } catch (err) {
        showAlert('alert', 'Error al eliminar el proyecto');
    }
}

// ── INIT ──────────────────────────────────────────────────────
loadProjects();