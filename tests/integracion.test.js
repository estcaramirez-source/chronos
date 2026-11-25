// Pruebas de INTEGRACIÓN entre módulos – estrategia ASCENDENTE (bottom-up).
//
// Nivel 1 (base, ya probado de forma unitaria): auth.js (sesión) y cart.js (carrito).
// Nivel 2: products.js, que depende de ambos a través de window.authSystem y
//          window.cartSystem.
// Aquí se cargan los módulos REALES en el mismo orden que en las páginas HTML
// (auth → cart → products), sin dobles de prueba, para verificar los contratos
// entre ellos: formato de precio del catálogo ↔ cálculo del carrito, sesión ↔
// checkout y valor de retorno de addToCart ↔ notificación al usuario.
const { loadScript, silenceNavigation, resetEnvironment } = require('./helpers');

const PAGE = `
    <span class="cart-badge"></span>
    <div id="emptyCart"></div><div id="cartContent"><div id="cartItems"></div></div>
    <span id="subtotal"></span><span id="shipping"></span><span id="tax"></span><span id="total"></span>
    <button id="checkoutBtn"></button>
    <div class="modal" id="loginRequiredModal" style="display:none"></div>
    <div class="modal" id="purchaseModal" style="display:none"><strong id="orderNumber"></strong></div>`;

const iniciarSesionDemo = () => {
    localStorage.setItem('currentUser', JSON.stringify({ id: '1', name: 'Usuario Demo', email: 'demo@chronosxxi.com' }));
};

const cargarModulos = () => ({
    auth: loadScript('auth.js'),
    cart: loadScript('cart.js'),
    products: loadScript('products.js')
});

beforeEach(() => {
    jest.useFakeTimers();
    resetEnvironment();
    document.body.innerHTML = PAGE;
    window.confirm = jest.fn(() => false);
    window.alert = jest.fn();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

test('INT-01 products + auth + cart: con sesión, agregar desde el catálogo calcula el precio real', () => {
    // Arrange
    iniciarSesionDemo();
    const { cart, products } = cargarModulos();

    // Act
    products.handleAddToCart('elegance-master'); // $23.999.000 en el catálogo
    products.handleAddToCart('expedition-field'); // $639.000

    // Assert
    expect(cart.getCartCount()).toBe(2);
    expect(cart.getCartTotal()).toBe(23999000 + 639000);
    expect(document.querySelector('.cart-badge').textContent).toBe('2');
    expect(document.querySelector('.cart-notification').textContent).toContain('Expedition Field');
});

test('INT-02 products + auth: sin sesión no se toca el carrito y se recuerda la página', () => {
    // Arrange
    const { cart, products } = cargarModulos();

    // Act
    products.handleAddToCart('fenix-7x-solar');

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(cart.getCart()).toEqual([]);
    expect(sessionStorage.getItem('returnTo')).toBe(window.location.pathname);
});

test('INT-03 auth + cart: el checkout usa la sesión real y registra la orden con IVA y envío', () => {
    // Arrange
    iniciarSesionDemo();
    const { cart, products } = cargarModulos();
    products.handleAddToCart('versa-4-sport'); // $919.000

    // Act
    document.getElementById('checkoutBtn').click();

    // Assert
    const [orden] = JSON.parse(localStorage.getItem('orders'));
    expect(orden.user.email).toBe('demo@chronosxxi.com');
    expect(orden.subtotal).toBe(919000);
    expect(orden.tax).toBe(174610);
    expect(orden.shipping).toBe(0);
    expect(orden.total).toBe(1093610);
    expect(cart.getCart()).toEqual([]);
});

test('INT-04 products + cart: al superar 10 unidades se avisa el límite en vez de "agregado"', () => {
    // Arrange
    iniciarSesionDemo();
    const { cart, products } = cargarModulos();
    for (let i = 0; i < 10; i++) products.handleAddToCart('g-shock-mudmaster');
    jest.runAllTimers(); // retira las notificaciones anteriores

    // Act
    products.handleAddToCart('g-shock-mudmaster');

    // Assert
    const aviso = document.querySelector('.cart-notification');
    expect(cart.getCartCount()).toBe(10);
    expect(aviso.textContent).toContain('máximo 10 unidades');
    expect(aviso.textContent).not.toContain('agregado al carrito');
    expect(aviso.classList.contains('warning')).toBe(true);
});

test('INT-05 auth + cart: cerrar sesión impide pagar el carrito guardado', () => {
    // Arrange
    silenceNavigation();
    iniciarSesionDemo();
    const { auth, products } = cargarModulos();
    products.handleAddToCart('prospex-diver');

    // Act
    auth.logout();
    document.getElementById('checkoutBtn').click();

    // Assert
    expect(document.getElementById('loginRequiredModal').style.display).toBe('flex');
    expect(localStorage.getItem('orders')).toBeNull();
});
