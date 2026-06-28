const API = 'http://localhost:8000/api';

// ── PROYECTOS ─────────────────────────────────────────────────
async function loadProjects() {
    const grid = document.getElementById('projectsGrid');

    try {
        const res = await fetch(`${API}/projects/`);
        const projects = await res.json();

        if (projects.length === 0) {
            grid.innerHTML = `<div class="empty-state">Próximamente habrá proyectos acá.</div>`;
            return;
        }

        grid.innerHTML = projects.map(p => `
            <div class="project-card">
                ${p.image
                    ? `<img src="${p.image}" alt="${p.title}">`
                    : `<div class="project-card-placeholder">💻</div>`
                }
                <div class="project-body">
                    ${p.featured ? `<span class="featured-badge">⭐ Destacado</span>` : ''}
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <div class="tech-tags">
                        ${p.technology_list.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        ${p.repo_url ? `<a href="${p.repo_url}" target="_blank" class="project-link">→ Repositorio</a>` : ''}
                        ${p.demo_url ? `<a href="${p.demo_url}" target="_blank" class="project-link">→ Ver demo</a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        grid.innerHTML = `<div class="empty-state">Error al cargar los proyectos.</div>`;
    }
}

// ── CERTIFICACIONES ───────────────────────────────────────────
async function loadCertifications() {
    const grid = document.getElementById('certificationsGrid');

    try {
        const res = await fetch(`${API}/certifications/`);
        const certifications = await res.json();

        if (certifications.length === 0) {
            grid.innerHTML = `<div class="empty-state">Próximamente habrá certificaciones acá.</div>`;
            return;
        }

        grid.innerHTML = certifications.map(c => `
            <div class="cert-card" onclick="openCertModal(${c.id})" style="cursor:pointer">
                ${c.image
                    ? `<img src="${c.image}" alt="${c.name}">`
                    : `<div class="cert-card-placeholder">🏆</div>`
                }
                <div class="cert-body">
                    <div class="cert-issuer">${c.issuer}</div>
                    <h3>${c.name}</h3>
                    <div class="cert-date">${formatCertDate(c.date)}</div>
                    ${c.credential_url
                        ? `<span class="cert-link">→ Ver credencial</span>`
                        : ''
                    }
                </div>
            </div>
        `).join('');

        window._certifications = certifications;

    } catch (err) {
        grid.innerHTML = `<div class="empty-state">Error al cargar las certificaciones.</div>`;
    }
}

// ── MODAL CERTIFICACIÓN ───────────────────────────────────────
function openCertModal(id) {
    const c = window._certifications.find(c => c.id === id);
    if (!c) return;

    const img = document.getElementById('certModalImage');
    const placeholder = document.getElementById('certModalPlaceholder');

    if (c.image) {
        img.src = c.image;
        img.alt = c.name;
        img.style.display = 'block';
        img.style.cursor = 'zoom-in';
        img.onclick = () => openLightbox(c.image, c.name);
        placeholder.style.display = 'none';
    } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
    }

    document.getElementById('certModalIssuer').textContent = c.issuer;
    document.getElementById('certModalName').textContent = c.name;
    document.getElementById('certModalDate').textContent = formatCertDate(c.date);

    const link = document.getElementById('certModalLink');
    if (c.credential_url) {
        link.href = c.credential_url;
        link.style.display = 'inline-block';
    } else {
        link.style.display = 'none';
    }

    document.getElementById('certModalOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCertModal() {
    document.getElementById('certModalOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

// ── LIGHTBOX ──────────────────────────────────────────────────
function openLightbox(src, alt) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxImg').alt = alt;
    document.getElementById('lightboxOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightboxOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

// ── CONTACTO ──────────────────────────────────────────────────
async function sendMessage() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
        showAlert('alertError', 'Por favor completá todos los campos');
        return;
    }

    const btn = document.getElementById('sendBtn');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/contact/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });

        if (!res.ok) {
            showAlert('alertError', 'Error al enviar el mensaje, intentá de nuevo');
            return;
        }

        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMessage').value = '';
        showAlert('alertSuccess', '¡Mensaje enviado! Te respondo a la brevedad.');

    } catch (err) {
        showAlert('alertError', 'Error al conectar con el servidor');
    } finally {
        btn.textContent = 'Enviar mensaje';
        btn.disabled = false;
    }
}

// ── HELPERS ───────────────────────────────────────────────────
function showAlert(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 5000);
}

function formatCertDate(dateStr) {
    const [year, month] = dateStr.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${months[parseInt(month) - 1]} ${year}`;
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    loadProjects();
    loadCertifications();

    // Cerrar modal certificación al hacer clic fuera
    document.getElementById('certModalOverlay').addEventListener('click', function (e) {
        if (e.target === this) closeCertModal();
    });

    // Cerrar lightbox al hacer clic fuera de la imagen
    document.getElementById('lightboxOverlay').addEventListener('click', function (e) {
        if (e.target !== document.getElementById('lightboxImg')) closeLightbox();
    });
});