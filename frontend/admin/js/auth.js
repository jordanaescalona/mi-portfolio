//const API = 'http://localhost:8000/api';
const API = 'https://web-production-0caf1.up.railway.app/api';
// Guarda el token al hacer login
function saveToken(access, refresh) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
}

// Devuelve el token de acceso
function getToken() {
    return localStorage.getItem('access_token');
}

// Cierra sesión y redirige al login
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = 'index.html';
}

// Verifica si hay token; si no, redirige al login
function requireAuth() {
    if (!getToken()) {
        window.location.href = 'index.html';
    }
}

// Hace un fetch autenticado (con el token en el header)
async function authFetch(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${getToken()}`,
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    // Si el token expiró, redirige al login
    if (response.status === 401) {
        logout();
        return;
    }

    return response;
}

// Muestra una alerta en pantalla
function showAlert(elementId, message, type = 'error') {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `alert ${type} show`;
    setTimeout(() => el.classList.remove('show'), 4000);
}