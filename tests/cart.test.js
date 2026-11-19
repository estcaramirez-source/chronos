const { loadScript, silenceNavigation, resetEnvironment } = require('./helpers');

const reloj = (overrides = {}) => ({
    id: 'reloj-1',
    name: 'Reloj de prueba',
    brand: 'MARCA',
    category: 'Clásicos',
    price: '$100000',
    ...overrides
});

const CART_PAGE = `
    <span class="cart-badge"></span><span class="cart-badge"></span>
    <p id="userGreeting">Bienvenido</p>
    <div id="emptyCart" style="display:none"></div>
    <div id="cartContent"><div id="cartItems"></div></div>
    <span id="subtotal"></span><span id="shipping"></span><span id="tax"></span><span id="total"></span>
    <button id="checkoutBtn">Pagar</button>
    <div class="modal" id="loginRequiredModal" style="display:none"></div>
    <div class="modal" id="purchaseModal" style="display:none"><strong id="orderNumber"></strong></div>
`;

const fakeAuth = (user) => ({
    isLoggedIn: () => user !== null,
    getCurrentUser: () => user
});

const demoUser = { id: '1', name: 'Usuario Demo', email: 'demo@chronosxxi.com' };

let cart;

beforeEach(() => {
    resetEnvironment();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
    cart = loadScript('cart.js');
});

describe('inicialización', () => {
    test('crea un carrito vacío en localStorage al cargar', () => {
        expect(localStorage.getItem('cart')).toBe('[]');
    });

    test('no sobrescribe un carrito existente', () => {
        localStorage.setItem('cart', JSON.stringify([{ ...reloj(), quantity: 2 }]));
        cart = loadScript('cart.js');
        expect(cart.getCart()).toHaveLength(1);
    });

    test('getCart devuelve [] si el valor almacenado es null', () => {
        localStorage.setItem('cart', 'null');
        expect(cart.getCart()).toEqual([]);
    });

    test('expone la API pública en window.cartSystem', () => {
        expect(Object.keys(window.cartSystem)).toEqual(expect.arrayContaining([
            'addToCart', 'removeFromCart', 'updateQuantity', 'clearCart',
            'getCart', 'getCartTotal', 'getCartCount', 'updateCartBadge'
        ]));
    });
});

describe('operaciones del carrito', () => {
    test('addToCart agrega el producto con cantidad 1 y fecha', () => {
        expect(cart.addToCart(reloj())).toBe(true);
        const [item] = cart.getCart();
        expect(item.quantity).toBe(1);
        expect(new Date(item.addedAt).toString()).not.toBe('Invalid Date');
    });

    test('addToCart incrementa la cantidad si el producto ya existe', () => {
        cart.addToCart(reloj());
        cart.addToCart(reloj());
        expect(cart.getCart()).toHaveLength(1);
        expect(cart.getCartCount()).toBe(2);
    });

    test('removeFromCart elimina solo el producto indicado', () => {
        cart.addToCart(reloj());
        cart.addToCart(reloj({ id: 'reloj-2' }));
        cart.removeFromCart('reloj-1');
        expect(cart.getCart().map(i => i.id)).toEqual(['reloj-2']);
    });

    test('updateQuantity cambia la cantidad', () => {
        cart.addToCart(reloj());
        cart.updateQuantity('reloj-1', 5);
        expect(cart.getCartCount()).toBe(5);
    });

    test('updateQuantity con 0 o menos elimina el producto', () => {
        cart.addToCart(reloj());
        cart.updateQuantity('reloj-1', 0);
        expect(cart.getCart()).toEqual([]);
    });

    test('updateQuantity ignora productos inexistentes', () => {
        cart.addToCart(reloj());
        cart.updateQuantity('no-existe', 3);
        expect(cart.getCartCount()).toBe(1);
    });

    test('clearCart vacía el carrito', () => {
        cart.addToCart(reloj());
        cart.clearCart();
        expect(cart.getCart()).toEqual([]);
    });

    test('getCartTotal multiplica precio por cantidad', () => {
        cart.addToCart(reloj({ price: '$639000' }));
        cart.updateQuantity('reloj-1', 2);
        expect(cart.getCartTotal()).toBe(1278000);
    });
});

describe('precios reales del catálogo (formato COP con puntos de miles)', () => {
    test('getCartTotal interpreta "$23.999.000" como 23.999.000 pesos', () => {
        cart.addToCart(reloj({ price: '$23.999.000' }));
        expect(cart.getCartTotal()).toBe(23999000);
    });

    test('getCartTotal suma varios productos con separadores de miles', () => {
        cart.addToCart(reloj({ id: 'a', price: '$639.000' }));
        cart.addToCart(reloj({ id: 'b', price: '$1.599.000' }));
        cart.updateQuantity('b', 2);
        expect(cart.getCartTotal()).toBe(639000 + 2 * 1599000);
    });

    test('el total de la orden incluye IVA y envío, igual que el resumen', () => {
        document.body.innerHTML = '<strong id="orderNumber"></strong><div id="purchaseModal"></div>';
        window.authSystem = fakeAuth(demoUser);
        cart.addToCart(reloj({ price: '$150.000' }));
        cart.processPurchase();
        const [order] = JSON.parse(localStorage.getItem('orders'));
        expect(order.subtotal).toBe(150000);
        expect(order.tax).toBe(28500);
        expect(order.shipping).toBe(15000);
        expect(order.total).toBe(193500);
    });
});

describe('interfaz del carrito', () => {
    beforeEach(() => {
        document.body.innerHTML = CART_PAGE;
    });

    test('updateCartBadge muestra la cantidad y oculta el badge si está vacío', () => {
        cart.addToCart(reloj());
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(b => {
            expect(b.textContent).toBe('1');
            expect(b.style.display).toBe('flex');
        });
        cart.clearCart();
        badges.forEach(b => expect(b.style.display).toBe('none'));
    });

    test('formatPrice usa formato de pesos colombianos', () => {
        expect(cart.formatPrice(1500000)).toMatch(/1\.500\.000/);
    });

    test('renderCart no falla si no está en la página del carrito', () => {
        document.body.innerHTML = '';
        expect(() => cart.renderCart()).not.toThrow();
    });

    test('renderCart muestra el estado vacío', () => {
        cart.renderCart();
        expect(document.getElementById('emptyCart').style.display).toBe('flex');
        expect(document.getElementById('cartContent').style.display).toBe('none');
    });

    test('renderCart pinta un ítem por producto', () => {
        cart.addToCart(reloj());
        cart.addToCart(reloj({ id: 'reloj-2', name: 'Otro reloj' }));
        cart.renderCart();
        const items = document.querySelectorAll('.cart-item');
        expect(items).toHaveLength(2);
        expect(items[1].querySelector('h4').textContent).toBe('Otro reloj');
        expect(document.getElementById('cartContent').style.display).toBe('flex');
    });

    test('resumen: cobra envío de $15.000 si el subtotal es menor a $200.000', () => {
        cart.addToCart(reloj({ price: '$100000' }));
        cart.updateCartSummary();
        expect(document.getElementById('tax').textContent).toMatch(/19\.000/);
        expect(document.getElementById('shipping').textContent).toMatch(/15\.000/);
        expect(document.getElementById('total').textContent).toMatch(/134\.000/);
    });

    test('resumen: envío gratis desde $200.000', () => {
        cart.addToCart(reloj({ price: '$300000' }));
        cart.updateCartSummary();
        expect(document.getElementById('shipping').textContent).toBe('Gratis');
        expect(document.getElementById('total').textContent).toMatch(/357\.000/);
    });

    test('changeQuantity suma y resta unidades', () => {
        cart.addToCart(reloj());
        cart.changeQuantity('reloj-1', 1);
        expect(cart.getCartCount()).toBe(2);
        cart.changeQuantity('reloj-1', -2);
        expect(cart.getCart()).toEqual([]);
        cart.changeQuantity('no-existe', 1);
        expect(cart.getCart()).toEqual([]);
    });

    test('removeItem pide confirmación antes de eliminar', () => {
        cart.addToCart(reloj());
        window.confirm.mockReturnValueOnce(false);
        cart.removeItem('reloj-1');
        expect(cart.getCartCount()).toBe(1);
        cart.removeItem('reloj-1');
        expect(cart.getCartCount()).toBe(0);
    });

    test('showLoginModal y closeModal muestran / ocultan los modales', () => {
        cart.showLoginModal();
        expect(document.getElementById('loginRequiredModal').style.display).toBe('flex');
        cart.closeModal();
        document.querySelectorAll('.modal').forEach(m => expect(m.style.display).toBe('none'));
    });

    test('showLoginModal no falla si el modal no existe', () => {
        document.body.innerHTML = '';
        expect(() => cart.showLoginModal()).not.toThrow();
    });

    test('clic sobre el fondo del modal lo cierra', () => {
        // En la página real auth.js se carga antes que cart.js
        window.authSystem = fakeAuth(null);
        cart = loadScript('cart.js');
        const modal = document.getElementById('loginRequiredModal');
        modal.style.display = 'flex';
        modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(modal.style.display).toBe('none');
    });

    test('redirectToLogin guarda la página de retorno', () => {
        silenceNavigation();
        cart.redirectToLogin();
        expect(sessionStorage.getItem('returnTo')).toBe('carrito.html');
    });

    test('closeModalAndRedirect cierra los modales', () => {
        silenceNavigation();
        document.getElementById('purchaseModal').style.display = 'flex';
        cart.closeModalAndRedirect();
        expect(document.getElementById('purchaseModal').style.display).toBe('none');
    });

    test('processPurchase registra la orden, vacía el carrito y muestra la confirmación', () => {
        window.authSystem = fakeAuth(demoUser);
        cart.addToCart(reloj({ price: '$100000' }));
        cart.processPurchase();

        const [order] = JSON.parse(localStorage.getItem('orders'));
        expect(order.orderNumber).toMatch(/^CHR-[0-9A-Z]+$/);
        expect(order.user).toEqual(demoUser);
        expect(order.subtotal).toBe(100000);
        expect(order.tax).toBe(19000);
        expect(order.status).toBe('confirmed');
        expect(cart.getCart()).toEqual([]);
        expect(document.getElementById('orderNumber').textContent).toBe(order.orderNumber);
        expect(document.getElementById('purchaseModal').style.display).toBe('flex');
    });
});

describe('inicialización en la página del carrito', () => {
    beforeEach(() => {
        document.body.innerHTML = CART_PAGE;
    });

    test('saluda al usuario con sesión y pinta el carrito', () => {
        localStorage.setItem('cart', JSON.stringify([{ ...reloj(), quantity: 1 }]));
        window.authSystem = fakeAuth(demoUser);
        loadScript('cart.js');
        expect(document.getElementById('userGreeting').textContent).toBe('Hola, Usuario Demo');
        expect(document.querySelectorAll('.cart-item')).toHaveLength(1);
    });

    test('checkout sin sesión muestra el modal de inicio de sesión', () => {
        window.authSystem = fakeAuth(null);
        loadScript('cart.js');
        document.getElementById('checkoutBtn').click();
        expect(document.getElementById('loginRequiredModal').style.display).toBe('flex');
        expect(document.getElementById('userGreeting').textContent).toBe('Bienvenido');
    });

    test('checkout con carrito vacío avisa al usuario', () => {
        window.authSystem = fakeAuth(demoUser);
        loadScript('cart.js');
        document.getElementById('checkoutBtn').click();
        expect(window.alert).toHaveBeenCalledWith('Tu carrito está vacío');
    });

    test('checkout con productos procesa la compra', () => {
        window.authSystem = fakeAuth(demoUser);
        const mod = loadScript('cart.js');
        mod.addToCart(reloj());
        document.getElementById('checkoutBtn').click();
        expect(JSON.parse(localStorage.getItem('orders'))).toHaveLength(1);
        expect(document.getElementById('purchaseModal').style.display).toBe('flex');
    });
});
