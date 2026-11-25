// Pruebas de CAJA BLANCA: un caso por cada camino independiente (camino base).
// Grafos de flujo y cálculo de V(G) en docs/diseno-casos-de-prueba.md.
const { loadScript, silenceNavigation, resetEnvironment } = require('./helpers');

beforeEach(() => {
    jest.useFakeTimers();
    resetEnvironment();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// updateQuantity(productId, quantity) – cart.js
// Nodos: N1 inicio · N2 ¿!product? · N3 ¿!isAllowedQuantity? · N4 return false
//        N5 ¿quantity <= 0? · N6 eliminar y return true · N7 actualizar y return true · N8 fin
// Aristas = 10, Nodos = 8  →  V(G) = 10 − 8 + 2 = 4   (= 3 decisiones + 1)
// ---------------------------------------------------------------------------
describe('updateQuantity – caminos base (V(G) = 4)', () => {
    const reloj = { id: 'sense-2-advanced', name: 'Sense 2', brand: 'FITBIT', category: 'Tecnológicos', price: '$1.399.000' };
    let cart;

    beforeEach(() => {
        cart = loadScript('cart.js');
        cart.addToCart(reloj);
    });

    test('CB-UQ-1 camino N1→N2→N4→N8: producto inexistente devuelve false', () => {
        // Act
        const r = cart.updateQuantity('no-existe', 2);

        // Assert
        expect(r).toBe(false);
        expect(cart.getCartCount()).toBe(1);
    });

    test('CB-UQ-2 camino N1→N2→N3→N4→N8: cantidad no permitida devuelve false', () => {
        // Act
        const r = cart.updateQuantity(reloj.id, 11);

        // Assert
        expect(r).toBe(false);
        expect(cart.getCartCount()).toBe(1);
    });

    test('CB-UQ-3 camino N1→N2→N3→N5→N6→N8: cantidad 0 elimina el producto', () => {
        // Act
        const r = cart.updateQuantity(reloj.id, 0);

        // Assert
        expect(r).toBe(true);
        expect(cart.getCart()).toEqual([]);
    });

    test('CB-UQ-4 camino N1→N2→N3→N5→N7→N8: cantidad válida actualiza y guarda', () => {
        // Act
        const r = cart.updateQuantity(reloj.id, 7);

        // Assert
        expect(r).toBe(true);
        expect(JSON.parse(localStorage.getItem('cart'))[0].quantity).toBe(7);
    });
});

// ---------------------------------------------------------------------------
// handleAddToCart(productId) – products.js
// Nodos: N1 ¿sesión? · N2 guardar returnTo y ¿confirm? · N3 ir a login · N4 return
//        N5 ¿producto existe? · N6 ¿addToCart ok? · N7 aviso "agregado" · N8 aviso "límite" · N9 fin
// Aristas = 12, Nodos = 9  →  V(G) = 12 − 9 + 2 = 5   (= 4 decisiones + 1)
// Dobles: authSystem es un STUB (respuesta fija) y cartSystem.addToCart un MOCK
// (se verifica la llamada), para recorrer cada camino de forma aislada.
// ---------------------------------------------------------------------------
describe('handleAddToCart – caminos base (V(G) = 5)', () => {
    let products;

    const preparar = ({ sesion, confirma = false, agrega = true }) => {
        window.authSystem = { isLoggedIn: () => sesion };
        window.cartSystem = { addToCart: jest.fn(() => agrega) };
        window.confirm = jest.fn(() => confirma);
        products = loadScript('products.js');
    };
    const aviso = () => document.querySelector('.cart-notification');

    test('CB-AC-1 camino N1→N2→N3→N4→N9: sin sesión y acepta ir al login', () => {
        // Arrange
        silenceNavigation();
        preparar({ sesion: false, confirma: true });

        // Act
        products.handleAddToCart('rangeman-solar');

        // Assert
        expect(sessionStorage.getItem('returnTo')).not.toBeNull();
        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(window.cartSystem.addToCart).not.toHaveBeenCalled();
    });

    test('CB-AC-2 camino N1→N2→N4→N9: sin sesión y cancela', () => {
        // Arrange
        preparar({ sesion: false, confirma: false });

        // Act
        products.handleAddToCart('rangeman-solar');

        // Assert
        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(window.cartSystem.addToCart).not.toHaveBeenCalled();
        expect(aviso()).toBeNull();
    });

    test('CB-AC-3 camino N1→N5→N9: con sesión y producto inexistente', () => {
        // Arrange
        preparar({ sesion: true });

        // Act
        products.handleAddToCart('reloj-que-no-existe');

        // Assert
        expect(window.cartSystem.addToCart).not.toHaveBeenCalled();
        expect(aviso()).toBeNull();
    });

    test('CB-AC-4 camino N1→N5→N6→N7→N9: con sesión, producto existe y se agrega', () => {
        // Arrange
        preparar({ sesion: true, agrega: true });

        // Act
        products.handleAddToCart('rangeman-solar');

        // Assert
        expect(window.cartSystem.addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 'rangeman-solar' }));
        expect(aviso().textContent).toContain('agregado al carrito');
    });

    test('CB-AC-5 camino N1→N5→N6→N8→N9: con sesión, producto existe pero alcanzó el límite', () => {
        // Arrange
        preparar({ sesion: true, agrega: false });

        // Act
        products.handleAddToCart('rangeman-solar');

        // Assert
        expect(aviso().classList.contains('warning')).toBe(true);
        expect(aviso().textContent).toContain('máximo 10 unidades');
    });
});
