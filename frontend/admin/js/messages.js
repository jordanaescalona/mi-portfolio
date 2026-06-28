requireAuth();

let currentMessageId = null;

// ── CARGAR MENSAJES ───────────────────────────────────────────
async function loadMessages() {
    const tbody = document.getElementById('messagesTable');

    try {
        const res = await authFetch(`${API}/contact/`);

        if (!res) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Error de autenticación — <a href="index.html" style="color:var(--accent)">volvé a iniciar sesión</a></td></tr>`;
            return;
        }

        console.log('Status contacto:', res.status);

        if (!res.ok) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Error ${res.status} al cargar mensajes</td></tr>`;
            return;
        }

        const messages = await res.json();
        console.log('Mensajes:', messages);

        // Badge de no leídos
        const unread = messages.filter(m => !m.read).length;
        const badge = document.getElementById('unreadBadge');
        badge.textContent = unread > 0 ? `${unread} sin leer` : '';

        if (messages.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No hay mensajes todavía
                        <p>Los mensajes del formulario de contacto aparecerán acá</p>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = messages.map(m => `
            <tr style="${!m.read ? 'font-weight:600' : ''}">
                <td>${m.name}</td>
                <td style="color:var(--text-muted); font-size:0.85rem">${m.email}</td>
                <td style="color:var(--text-muted); font-size:0.85rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
                    ${m.message}
                </td>
                <td style="font-size:0.85rem">${new Date(m.created_at).toLocaleDateString('es-AR')}</td>
                <td>
                    <span class="badge ${m.read ? 'badge-muted' : 'badge-success'}">
                        ${m.read ? 'Leído' : 'Nuevo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary" onclick="openModal(${m.id})">
                        Ver
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Error:', err);
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Error al conectar con el servidor</td></tr>`;
    }
}

// ── MODAL VER MENSAJE ─────────────────────────────────────────
async function openModal(id) {
    currentMessageId = id;

    try {
        const res = await authFetch(`${API}/contact/`);
        const messages = await res.json();
        const message = messages.find(m => m.id === id);

        if (!message) {
            showAlert('alert', 'No se encontró el mensaje');
            return;
        }

        document.getElementById('modalName').textContent = message.name;
        document.getElementById('modalEmail').textContent = message.email;
        document.getElementById('modalMessage').textContent = message.message;

        const markBtn = document.getElementById('markReadBtn');
        if (message.read) {
            markBtn.style.display = 'none';
        } else {
            markBtn.style.display = 'inline-block';
            markBtn.onclick = () => markAsRead(id);
        }

        document.getElementById('modalOverlay').classList.add('show');

    } catch (err) {
        console.error('Error abriendo mensaje:', err);
        showAlert('alert', 'Error al cargar el mensaje');
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    currentMessageId = null;
}

// ── MARCAR COMO LEÍDO ─────────────────────────────────────────
async function markAsRead(id) {
    try {
        const res = await authFetch(`${API}/contact/${id}/read/`, {
            method: 'PATCH'
        });

        if (!res || !res.ok) {
            showAlert('alert', 'Error al marcar el mensaje');
            return;
        }

        closeModal();
        showAlert('alert', 'Mensaje marcado como leído', 'success');
        loadMessages();

    } catch (err) {
        console.error('Error marcando como leído:', err);
        showAlert('alert', 'Error al conectar con el servidor');
    }
}

// ── INIT ──────────────────────────────────────────────────────
loadMessages();