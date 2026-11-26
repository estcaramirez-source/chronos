// Pruebas de seguridad (B4) – regresión DEF-08.
// "¿Olvidaste tu contraseña?" mostraba la contraseña del usuario en un alert:
// cualquiera que conociera un correo registrado podía ver su clave.
const { loadScript, resetEnvironment } = require('./helpers');

beforeEach(() => {
    resetEnvironment();
    document.body.innerHTML = '<a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>';
    window.alert = jest.fn();
    window.prompt = jest.fn(() => 'demo@chronosxxi.com');
    loadScript('auth.js');
});

test('recuperar contraseña NO revela la contraseña guardada', () => {
    // Act
    document.querySelector('.forgot-password').click();

    // Assert
    const mensaje = window.alert.mock.calls[0][0];
    expect(mensaje).not.toContain('demo123');
    expect(mensaje).not.toMatch(/contraseña es/i);
});

test('recuperar contraseña responde igual exista o no el correo (no revela cuentas registradas)', () => {
    // Arrange
    window.prompt
        .mockReturnValueOnce('demo@chronosxxi.com')
        .mockReturnValueOnce('nadie@correo.com');

    // Act
    document.querySelector('.forgot-password').click();
    document.querySelector('.forgot-password').click();

    // Assert
    const [[registrado], [noRegistrado]] = window.alert.mock.calls;
    expect(registrado).toBe(noRegistrado);
});
