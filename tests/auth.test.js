const { loadScript, silenceNavigation, resetEnvironment } = require('./helpers');

// Fragmento equivalente al formulario de login.html (mismos id y clases).
const LOGIN_PAGE = `
    <button class="auth-tab active" data-tab="login">Iniciar sesión</button>
    <button class="auth-tab" data-tab="register">Registrarse</button>
    <div class="auth-form-container active" id="loginForm">
        <form id="loginFormSubmit">
            <input type="email" id="loginEmail">
            <input type="password" id="loginPassword">
            <button type="button" class="toggle-password" data-target="loginPassword"><i class="fas fa-eye"></i></button>
            <input type="checkbox" name="remember">
            <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
            <div id="loginMessage"></div>
        </form>
        <a href="#" class="social-btn google">Google</a>
        <a href="#" class="social-btn facebook">Facebook</a>
    </div>
    <div class="auth-form-container" id="registerForm">
        <form id="registerFormSubmit">
            <input type="text" id="registerName">
            <input type="email" id="registerEmail">
            <input type="password" id="registerPassword">
            <input type="password" id="registerConfirmPassword">
            <input type="checkbox" name="terms">
            <div id="registerMessage"></div>
        </form>
    </div>
`;

const $ = (sel) => document.querySelector(sel);
const submit = (formId) => $(formId).dispatchEvent(new Event('submit', { cancelable: true }));
const users = () => JSON.parse(localStorage.getItem('users'));

let auth;

beforeEach(() => {
    jest.useFakeTimers();
    resetEnvironment();
    window.alert = jest.fn();
    window.prompt = jest.fn();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

describe('utilidades y sesión', () => {
    beforeEach(() => {
        auth = loadScript('auth.js');
    });

    test('crea el usuario demo si no hay usuarios', () => {
        expect(users()).toEqual([
            expect.objectContaining({ id: '1', email: 'demo@chronosxxi.com' })
        ]);
    });

    test('no sobrescribe usuarios existentes', () => {
        localStorage.setItem('users', JSON.stringify([{ id: '9', email: 'a@b.co' }]));
        loadScript('auth.js');
        expect(users()).toHaveLength(1);
        expect(users()[0].id).toBe('9');
    });

    test.each([
        ['demo@chronosxxi.com', true],
        ['nombre.apellido@dominio.com.co', true],
        ['sin-arroba.com', false],
        ['con espacio@x.com', false],
        ['usuario@sin-punto', false],
        ['', false]
    ])('validateEmail(%p) = %p', (email, esperado) => {
        expect(auth.validateEmail(email)).toBe(esperado);
    });

    test('generateId produce identificadores únicos', () => {
        const ids = new Set(Array.from({ length: 50 }, () => auth.generateId()));
        expect(ids.size).toBe(50);
    });

    test('sin sesión: checkSession es null e isLoggedIn es false', () => {
        expect(auth.checkSession()).toBeNull();
        expect(auth.isLoggedIn()).toBe(false);
        expect(auth.getCurrentUser()).toBeNull();
    });

    test('lee la sesión desde localStorage ("Recordarme")', () => {
        localStorage.setItem('currentUser', JSON.stringify({ id: '1', name: 'Demo' }));
        expect(auth.isLoggedIn()).toBe(true);
        expect(auth.getCurrentUser().name).toBe('Demo');
    });

    test('lee la sesión desde sessionStorage', () => {
        sessionStorage.setItem('currentUser', JSON.stringify({ id: '2', name: 'Temporal' }));
        expect(auth.getCurrentUser().id).toBe('2');
    });

    test('logout elimina la sesión de ambos almacenamientos', () => {
        silenceNavigation();
        localStorage.setItem('currentUser', '{"id":"1"}');
        sessionStorage.setItem('currentUser', '{"id":"1"}');
        auth.logout();
        expect(auth.isLoggedIn()).toBe(false);
    });

    test('showMessage muestra el mensaje y lo oculta a los 5 segundos', () => {
        document.body.innerHTML = '<div id="msg"></div>';
        auth.showMessage('msg', 'Hola', 'error');
        const el = $('#msg');
        expect(el.textContent).toBe('Hola');
        expect(el.className).toBe('form-message error');
        expect(el.style.display).toBe('block');
        jest.advanceTimersByTime(5000);
        expect(el.style.display).toBe('none');
    });

    test('expone la API pública en window.authSystem', () => {
        expect(Object.keys(window.authSystem)).toEqual(
            ['isLoggedIn', 'getCurrentUser', 'logout', 'checkSession']
        );
    });
});

describe('página de login', () => {
    beforeEach(() => {
        document.body.innerHTML = LOGIN_PAGE;
        auth = loadScript('auth.js');
    });

    test('cambia entre las pestañas de login y registro', () => {
        $('.auth-tab[data-tab="register"]').click();
        expect($('#registerForm').classList.contains('active')).toBe(true);
        expect($('#loginForm').classList.contains('active')).toBe(false);
        $('.auth-tab[data-tab="login"]').click();
        expect($('#loginForm').classList.contains('active')).toBe(true);
    });

    test('muestra y oculta la contraseña', () => {
        const input = $('#loginPassword');
        const icon = $('.toggle-password i');
        $('.toggle-password').click();
        expect(input.type).toBe('text');
        expect(icon.classList.contains('fa-eye-slash')).toBe(true);
        $('.toggle-password').click();
        expect(input.type).toBe('password');
        expect(icon.classList.contains('fa-eye')).toBe(true);
    });

    describe('registro', () => {
        const fill = ({ name = 'Ana Pérez', email = 'ana@correo.com', pass = 'secreto1', confirm = pass, terms = true } = {}) => {
            $('#registerName').value = name;
            $('#registerEmail').value = email;
            $('#registerPassword').value = pass;
            $('#registerConfirmPassword').value = confirm;
            $('input[name="terms"]').checked = terms;
            submit('#registerFormSubmit');
            return $('#registerMessage');
        };

        test.each([
            [{ name: 'Al' }, 'El nombre debe tener al menos 3 caracteres'],
            [{ email: 'correo-invalido' }, 'Por favor ingresa un correo electrónico válido'],
            [{ pass: '123' }, 'La contraseña debe tener al menos 6 caracteres'],
            [{ confirm: 'otra-clave' }, 'Las contraseñas no coinciden'],
            [{ terms: false }, 'Debes aceptar los términos y condiciones'],
            [{ email: 'DEMO@chronosxxi.com' }, 'Este correo electrónico ya está registrado']
        ])('rechaza datos inválidos %p', (datos, mensaje) => {
            const msg = fill(datos);
            expect(msg.textContent).toBe(mensaje);
            expect(msg.className).toContain('error');
            expect(users()).toHaveLength(1);
        });

        test('crea la cuenta, normaliza el correo y vuelve al login', () => {
            const msg = fill({ email: '  Ana@Correo.com ' });
            expect(msg.className).toContain('success');
            expect(users()).toHaveLength(2);
            expect(users()[1]).toEqual(expect.objectContaining({ name: 'Ana Pérez', email: 'ana@correo.com' }));

            jest.advanceTimersByTime(2000);
            expect($('#loginForm').classList.contains('active')).toBe(true);
            expect($('#loginEmail').value).toBe('ana@correo.com');
        });
    });

    describe('inicio de sesión', () => {
        const login = (email, password, remember = false) => {
            $('#loginEmail').value = email;
            $('#loginPassword').value = password;
            $('input[name="remember"]').checked = remember;
            submit('#loginFormSubmit');
            return $('#loginMessage');
        };

        test('rechaza correo inválido', () => {
            expect(login('demo', 'demo123').textContent).toBe('Por favor ingresa un correo electrónico válido');
        });

        test('rechaza contraseña vacía', () => {
            expect(login('demo@chronosxxi.com', '').textContent).toBe('Por favor ingresa tu contraseña');
        });

        test('rechaza credenciales incorrectas', () => {
            expect(login('demo@chronosxxi.com', 'mala').textContent).toBe('Correo o contraseña incorrectos');
            expect(auth.isLoggedIn()).toBe(false);
        });

        test('con "Recordarme" guarda la sesión en localStorage', () => {
            const msg = login('demo@chronosxxi.com', 'demo123', true);
            expect(msg.className).toContain('success');
            const session = JSON.parse(localStorage.getItem('currentUser'));
            expect(session).toEqual(expect.objectContaining({ id: '1', email: 'demo@chronosxxi.com' }));
            expect(session).not.toHaveProperty('password');
        });

        test('sin "Recordarme" guarda la sesión en sessionStorage y redirige', () => {
            silenceNavigation();
            sessionStorage.setItem('returnTo', 'carrito.html');
            login('demo@chronosxxi.com', 'demo123');
            expect(sessionStorage.getItem('currentUser')).not.toBeNull();
            expect(localStorage.getItem('currentUser')).toBeNull();
            jest.advanceTimersByTime(1500);
            expect(sessionStorage.getItem('returnTo')).toBeNull();
        });
    });

    test('los botones sociales informan que están en desarrollo', () => {
        $('.social-btn.google').click();
        $('.social-btn.facebook').click();
        expect(window.alert).toHaveBeenNthCalledWith(1, expect.stringContaining('Google'));
        expect(window.alert).toHaveBeenNthCalledWith(2, expect.stringContaining('Facebook'));
    });

    test('recuperar contraseña: correo registrado', () => {
        window.prompt.mockReturnValue('DEMO@chronosxxi.com');
        $('.forgot-password').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('recibirás un enlace para restablecer tu contraseña'));
    });

    test('recuperar contraseña: correo no registrado recibe el mismo mensaje neutro', () => {
        window.prompt.mockReturnValue('nadie@x.com');
        $('.forgot-password').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Si el correo está registrado'));
    });

    test('recuperar contraseña: el usuario cancela', () => {
        window.prompt.mockReturnValue(null);
        $('.forgot-password').click();
        expect(window.alert).not.toHaveBeenCalled();
    });
});

test('en login.html con sesión activa redirige al inicio', () => {
    silenceNavigation();
    window.history.pushState({}, '', '/login.html');
    localStorage.setItem('currentUser', '{"id":"1"}');
    expect(() => loadScript('auth.js')).not.toThrow();
    window.history.pushState({}, '', '/');
});
