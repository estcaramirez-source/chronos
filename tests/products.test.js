const { loadScript, silenceNavigation, resetEnvironment } = require('./helpers');

let products;

beforeEach(() => {
    jest.useFakeTimers();
    resetEnvironment();
    window.confirm = jest.fn(() => false);
    window.cartSystem = { addToCart: jest.fn(() => true) };
    window.authSystem = { isLoggedIn: jest.fn(() => true) };
    products = loadScript('products.js');
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

describe('catálogo de productos', () => {
    const lista = () => Object.entries(products.productsDatabase);

    test('contiene 18 productos, 6 por categoría', () => {
        expect(lista()).toHaveLength(18);
        const porCategoria = lista().reduce((acc, [, p]) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});
        expect(porCategoria).toEqual({ 'Clásicos': 6, 'Tecnológicos': 6, 'Deportivos': 6 });
    });

    test('cada producto tiene todos los campos y su id coincide con la clave', () => {
        lista().forEach(([clave, p]) => {
            expect(p.id).toBe(clave);
            ['name', 'brand', 'category', 'price', 'description', 'image'].forEach(campo => {
                expect(typeof p[campo]).toBe('string');
                expect(p[campo].length).toBeGreaterThan(0);
            });
            expect(p.image).toMatch(/^https:\/\//);
        });
    });

    test('los precios usan formato COP con separador de miles ($X.XXX.XXX)', () => {
        lista().forEach(([, p]) => expect(p.price).toMatch(/^\$\d{1,3}(\.\d{3})+$/));
    });

    test('el rango de precios coincide con el README ($639.000 - $50.000.000)', () => {
        const valores = lista().map(([, p]) => Number(p.price.replace(/\D/g, '')));
        expect(Math.min(...valores)).toBe(639000);
        expect(Math.max(...valores)).toBe(50000000);
    });
});

describe('handleAddToCart', () => {
    test('sin sesión guarda la página de retorno y pregunta si desea iniciar sesión', () => {
        window.authSystem.isLoggedIn.mockReturnValue(false);
        products.handleAddToCart('elegance-master');
        expect(sessionStorage.getItem('returnTo')).toBe(window.location.pathname);
        expect(window.confirm).toHaveBeenCalled();
        expect(window.cartSystem.addToCart).not.toHaveBeenCalled();
    });

    test('sin sesión y aceptando, redirige al login', () => {
        silenceNavigation();
        window.authSystem.isLoggedIn.mockReturnValue(false);
        window.confirm.mockReturnValue(true);
        expect(() => products.handleAddToCart('elegance-master')).not.toThrow();
        expect(window.cartSystem.addToCart).not.toHaveBeenCalled();
    });

    test('con sesión agrega el producto y muestra la notificación', () => {
        products.handleAddToCart('fenix-7x-solar');
        expect(window.cartSystem.addToCart).toHaveBeenCalledWith(products.productsDatabase['fenix-7x-solar']);

        const noti = document.querySelector('.cart-notification');
        expect(noti.textContent).toContain('Fenix 7X Solar');
        jest.advanceTimersByTime(100);
        expect(noti.classList.contains('show')).toBe(true);
        jest.advanceTimersByTime(3000);
        expect(noti.classList.contains('show')).toBe(false);
        jest.advanceTimersByTime(300);
        expect(document.querySelector('.cart-notification')).toBeNull();
    });

    test('ignora identificadores que no existen', () => {
        products.handleAddToCart('no-existe');
        expect(window.cartSystem.addToCart).not.toHaveBeenCalled();
    });

    test('inyecta los estilos de la notificación y expone la función global', () => {
        expect(document.head.querySelector('style').textContent).toContain('.cart-notification');
        expect(window.handleAddToCart).toBe(products.handleAddToCart);
    });
});
