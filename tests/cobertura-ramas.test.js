// Pruebas agregadas para cumplir el nuevo umbral de ramas (95 %) – análisis C6.
// Cubren ramas defensivas que antes no se ejecutaban. Quedan sin cubrir solo las
// guardas `typeof module !== 'undefined'`, cuya rama falsa ocurre únicamente en
// el navegador (en Node/Jest `module` siempre existe).
const { loadScript, silenceNavigation, resetEnvironment } = require('./helpers');

beforeEach(() => {
    jest.useFakeTimers();
    resetEnvironment();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

test('getUsers devuelve [] si "users" contiene un valor que no es lista', () => {
    // Arrange
    const auth = loadScript('auth.js');
    localStorage.setItem('users', '{"id":"1"}');

    // Act
    const usuarios = auth.getUsers();

    // Assert
    expect(usuarios).toEqual([]);
});

test('después de iniciar sesión sin página de retorno se redirige al inicio', () => {
    // Arrange
    silenceNavigation();
    document.body.innerHTML = `
        <form id="loginFormSubmit">
            <input id="loginEmail" value="demo@chronosxxi.com"><input id="loginPassword" value="demo123">
            <input type="checkbox" name="remember"><div id="loginMessage"></div>
        </form>`;
    loadScript('auth.js');

    // Act
    document.getElementById('loginFormSubmit').dispatchEvent(new Event('submit', { cancelable: true }));
    jest.advanceTimersByTime(1500);

    // Assert
    expect(sessionStorage.getItem('currentUser')).not.toBeNull();
    expect(sessionStorage.getItem('returnTo')).toBeNull();
});

describe('renderCart en una página con solo el contenedor de ítems', () => {
    let cart;
    beforeEach(() => {
        document.body.innerHTML = '<div id="cartItems"></div>';
        cart = loadScript('cart.js');
    });

    test('con el carrito vacío no falla aunque falten los bloques de estado', () => {
        // Act + Assert
        expect(() => cart.renderCart()).not.toThrow();
        expect(document.getElementById('cartItems').children).toHaveLength(0);
    });

    test('con productos pinta los ítems aunque falten los bloques de estado', () => {
        // Arrange
        cart.addToCart({ id: 'r1', name: 'Reloj', brand: 'X', category: 'Clásicos', price: '$639.000' });

        // Act
        cart.renderCart();

        // Assert
        expect(document.querySelectorAll('.cart-item')).toHaveLength(1);
    });
});
