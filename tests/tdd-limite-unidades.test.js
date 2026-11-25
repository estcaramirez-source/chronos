// TDD #2 – Cambio evolutivo: máximo 10 unidades por producto en el carrito.
// Regla de negocio (RF06): por ser relojes de alto valor, una orden no puede
// incluir más de 10 unidades de la misma referencia. La cantidad debe ser un
// número entero; 0 o menos elimina el producto (comportamiento existente).
const { loadScript, resetEnvironment } = require('./helpers');

const reloj = { id: 'prospex-diver', name: 'Prospex Diver', brand: 'SEIKO', category: 'Deportivos', price: '$2.399.000' };

let cart;

beforeEach(() => {
    resetEnvironment();
    document.body.innerHTML = '<div id="emptyCart"></div><div id="cartContent"><div id="cartItems"></div></div>';
    cart = loadScript('cart.js');
});

const cantidad = () => cart.getCart()[0].quantity;

test('addToCart permite llegar exactamente a 10 unidades', () => {
    // Arrange: carrito vacío

    // Act
    const resultados = Array.from({ length: 10 }, () => cart.addToCart(reloj));

    // Assert
    expect(resultados.every(Boolean)).toBe(true);
    expect(cantidad()).toBe(10);
});

test('addToCart rechaza la unidad número 11 y deja la cantidad en 10', () => {
    // Arrange
    for (let i = 0; i < 10; i++) cart.addToCart(reloj);

    // Act
    const resultado = cart.addToCart(reloj);

    // Assert
    expect(resultado).toBe(false);
    expect(cantidad()).toBe(10);
});

test('updateQuantity acepta el máximo (10) y devuelve true', () => {
    // Arrange
    cart.addToCart(reloj);

    // Act
    const resultado = cart.updateQuantity(reloj.id, 10);

    // Assert
    expect(resultado).toBe(true);
    expect(cantidad()).toBe(10);
});

test('updateQuantity rechaza 11 unidades y conserva la cantidad anterior', () => {
    // Arrange
    cart.addToCart(reloj);
    cart.updateQuantity(reloj.id, 4);

    // Act
    const resultado = cart.updateQuantity(reloj.id, 11);

    // Assert
    expect(resultado).toBe(false);
    expect(cantidad()).toBe(4);
});

test.each([2.5, NaN, Infinity])('updateQuantity rechaza cantidades no enteras (%p)', (valor) => {
    // Arrange
    cart.addToCart(reloj);

    // Act
    const resultado = cart.updateQuantity(reloj.id, valor);

    // Assert
    expect(resultado).toBe(false);
    expect(cantidad()).toBe(1);
});

test('el botón "+" no supera el máximo al cambiar la cantidad desde la interfaz', () => {
    // Arrange
    cart.addToCart(reloj);
    cart.updateQuantity(reloj.id, 10);

    // Act
    cart.changeQuantity(reloj.id, 1);

    // Assert
    expect(cantidad()).toBe(10);
});

test('el botón "+" se muestra deshabilitado cuando el producto llega al máximo', () => {
    // Arrange
    cart.addToCart(reloj);
    cart.updateQuantity(reloj.id, 10);

    // Act
    cart.renderCart();

    // Assert
    expect(document.querySelector('.qty-btn.plus').disabled).toBe(true);
    expect(document.querySelector('.qty-btn.minus').disabled).toBe(false);
});
