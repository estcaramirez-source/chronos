// ==========================================
// SISTEMA DE AUTENTICACIÓN - CHRONOS XXI
// ==========================================

// Lee y decodifica un valor JSON del almacenamiento indicado.
// Devuelve null si la clave no existe o su contenido está corrupto.
function readStorageJSON(storage, key) {
    try {
        return JSON.parse(storage.getItem(key));
    } catch {
        return null;
    }
}

// Lista de usuarios registrados; siempre devuelve un arreglo.
function getUsers() {
    const users = readStorageJSON(localStorage, 'users');
    return Array.isArray(users) ? users : [];
}

// Inicializar usuarios de prueba si no existen o si la lista guardada está corrupta
if (!Array.isArray(readStorageJSON(localStorage, 'users'))) {
    const defaultUsers = [
        {
            id: '1',
            name: 'Usuario Demo',
            email: 'demo@chronosxxi.com',
            password: 'demo123',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Cambio de tabs (Login/Registro)
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form-container');

authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Remover active de todos los tabs
        authTabs.forEach(t => t.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        
        // Activar tab seleccionado
        tab.classList.add('active');
        
        if (targetTab === 'login') {
            document.getElementById('loginForm').classList.add('active');
        } else {
            document.getElementById('registerForm').classList.add('active');
        }
    });
});

// Toggle password visibility
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`;
    messageElement.style.display = 'block';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==========================================
// SISTEMA DE REGISTRO
// ==========================================

const registerFormElement = document.getElementById('registerFormSubmit');

if (registerFormElement) {
    registerFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim().toLowerCase();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const termsAccepted = document.querySelector('input[name="terms"]').checked;
        
        // Validaciones
        if (name.length < 3) {
            showMessage('registerMessage', 'El nombre debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showMessage('registerMessage', 'Por favor ingresa un correo electrónico válido', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('registerMessage', 'La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('registerMessage', 'Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (!termsAccepted) {
            showMessage('registerMessage', 'Debes aceptar los términos y condiciones', 'error');
            return;
        }
        
        // Verificar si el usuario ya existe
        const users = getUsers();
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showMessage('registerMessage', 'Este correo electrónico ya está registrado', 'error');
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: generateId(),
            name: name,
            email: email,
            password: password, // En producción, esto debe estar hasheado
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showMessage('registerMessage', '¡Cuenta creada exitosamente! Redirigiendo...', 'success');
        
        // Limpiar formulario
        registerFormElement.reset();
        
        // Cambiar a tab de login después de 2 segundos
        setTimeout(() => {
            document.querySelector('.auth-tab[data-tab="login"]').click();
            // Prellenar email en login
            document.getElementById('loginEmail').value = email;
        }, 2000);
    });
}

// ==========================================
// SISTEMA DE LOGIN
// ==========================================

const loginFormElement = document.getElementById('loginFormSubmit');

if (loginFormElement) {
    loginFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        const remember = document.querySelector('input[name="remember"]').checked;
        
        // Validaciones
        if (!validateEmail(email)) {
            showMessage('loginMessage', 'Por favor ingresa un correo electrónico válido', 'error');
            return;
        }
        
        if (password.length === 0) {
            showMessage('loginMessage', 'Por favor ingresa tu contraseña', 'error');
            return;
        }
        
        // Verificar credenciales
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            showMessage('loginMessage', 'Correo o contraseña incorrectos', 'error');
            return;
        }
        
        // Login exitoso
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
            loginTime: new Date().toISOString()
        };
        
        // Guardar sesión
        if (remember) {
            localStorage.setItem('currentUser', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
        }
        
        showMessage('loginMessage', '¡Inicio de sesión exitoso! Redirigiendo...', 'success');
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            // Redirigir a la página anterior o al home
            const previousPage = sessionStorage.getItem('returnTo') || 'index.html';
            sessionStorage.removeItem('returnTo');
            window.location.href = previousPage;
        }, 1500);
    });
}

// ==========================================
// VERIFICAR SESIÓN ACTIVA
// ==========================================

// Sesión "Recordarme" (localStorage) o de pestaña (sessionStorage); null si no hay o está corrupta.
function checkSession() {
    return readStorageJSON(localStorage, 'currentUser') || readStorageJSON(sessionStorage, 'currentUser');
}

function isLoggedIn() {
    return checkSession() !== null;
}

function getCurrentUser() {
    return checkSession();
}

function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Si ya hay sesión activa y estamos en la página de login, redirigir
if (window.location.pathname.includes('login.html') && isLoggedIn()) {
    window.location.href = 'index.html';
}

// ==========================================
// BOTONES SOCIALES (Placeholder)
// ==========================================

const socialButtons = document.querySelectorAll('.social-btn');

socialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
        alert(`Inicio de sesión con ${provider} - Funcionalidad en desarrollo`);
    });
});

// ==========================================
// ENLACE DE OLVIDÉ MI CONTRASEÑA
// ==========================================

const forgotPasswordLink = document.querySelector('.forgot-password');
const RECOVERY_MESSAGE = 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.\n\n(Simulación: la tienda aún no envía correos.)';

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        const email = prompt('Ingresa tu correo electrónico para recuperar tu contraseña:');
        
        // Respuesta neutra (DEF-08): nunca se muestra la contraseña y el mensaje es el
        // mismo exista o no la cuenta, para no revelar qué correos están registrados.
        if (email) {
            alert(RECOVERY_MESSAGE);
        }
    });
}

// Exportar funciones para usar en otros archivos
window.authSystem = {
    isLoggedIn,
    getCurrentUser,
    logout,
    checkSession
};

// Exportación para pruebas automatizadas (Node/Jest). En el navegador `module` no existe y se ignora.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showMessage,
        readStorageJSON,
        getUsers,
        generateId,
        validateEmail,
        checkSession,
        isLoggedIn,
        getCurrentUser,
        logout
    };
}
