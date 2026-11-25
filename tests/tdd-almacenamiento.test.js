// TDD #1 – Almacenamiento tolerante a datos corruptos (mantenimiento preventivo).
// Si localStorage contiene JSON inválido (edición manual, extensión del navegador,
// versión anterior de la app), la tienda no debe dejar de funcionar.
const { loadScript, resetEnvironment } = require('./helpers');

beforeEach(() => {
    resetEnvironment();
});

describe('carrito con datos corruptos en localStorage', () => {
    test('getCart devuelve un carrito vacío si el JSON guardado es inválido', () => {
        // Arrange
        const cart = loadScript('cart.js');
        localStorage.setItem('cart', '{corrupto');

        // Act
        const resultado = cart.getCart();

        // Assert
        expect(resultado).toEqual([]);
    });

    test('getCart descarta un valor guardado que no es una lista', () => {
        // Arrange
        const cart = loadScript('cart.js');
        localStorage.setItem('cart', '{"id":"reloj"}');

        // Act
        const resultado = cart.getCart();

        // Assert
        expect(resultado).toEqual([]);
    });

    test('cargar cart.js con un carrito corrupto no interrumpe la página', () => {
        // Arrange
        localStorage.setItem('cart', 'no-es-json');

        // Act
        const cargar = () => loadScript('cart.js');

        // Assert
        expect(cargar).not.toThrow();
    });

    test('processPurchase conserva el historial aunque "orders" esté corrupto', () => {
        // Arrange
        document.body.innerHTML = '<strong id="orderNumber"></strong><div id="purchaseModal"></div>';
        window.authSystem = { getCurrentUser: () => ({ id: '1', name: 'Demo', email: 'demo@chronosxxi.com' }) };
        const cart = loadScript('cart.js');
        cart.addToCart({ id: 'r1', name: 'Reloj', brand: 'X', category: 'Clásicos', price: '$639.000' });
        localStorage.setItem('orders', '[roto');

        // Act
        cart.processPurchase();

        // Assert
        expect(JSON.parse(localStorage.getItem('orders'))).toHaveLength(1);
    });
});

describe('sesión con datos corruptos en el almacenamiento', () => {
    test('checkSession devuelve null si currentUser no es JSON válido', () => {
        // Arrange
        const auth = loadScript('auth.js');
        localStorage.setItem('currentUser', '{sin-cerrar');

        // Act
        const sesion = auth.checkSession();

        // Assert
        expect(sesion).toBeNull();
        expect(auth.isLoggedIn()).toBe(false);
    });

    test('cargar auth.js con la lista de usuarios corrupta restaura el usuario demo', () => {
        // Arrange
        localStorage.setItem('users', 'basura');

        // Act
        loadScript('auth.js');

        // Assert
        const usuarios = JSON.parse(localStorage.getItem('users'));
        expect(usuarios.map(u => u.email)).toContain('demo@chronosxxi.com');
    });
});
