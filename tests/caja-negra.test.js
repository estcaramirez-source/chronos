// Pruebas de CAJA NEGRA: partición de equivalencia y análisis de valores límite.
// Los identificadores (CN-xx) corresponden a las tablas de docs/diseno-casos-de-prueba.md.
const { loadScript, resetEnvironment } = require('./helpers');

beforeEach(() => {
    resetEnvironment();
});

// ---------------------------------------------------------------------------
// F1. validateEmail(email) – RF01 Registro / RF02 Inicio de sesión
// Clases válidas:   CV1 = local@dominio.ext (sin espacios, una sola @)
// Clases inválidas: CI1 sin @ · CI2 sin punto en el dominio · CI3 con espacios
//                   CI4 parte local vacía · CI5 extensión vacía · CI6 dos @ · CI7 vacío
// ---------------------------------------------------------------------------
describe('F1 validateEmail – partición de equivalencia y límites', () => {
    let auth;
    beforeEach(() => {
        auth = loadScript('auth.js');
    });

    test.each([
        ['CN-01', 'CV1', 'cliente@chronosxxi.com', true],
        ['CN-02', 'CV1 límite inferior (1 carácter por parte)', 'a@b.c', true],
        ['CN-03', 'CV1 dominio compuesto', 'ana.perez@correo.edu.co', true],
        ['CN-04', 'CI1 sin @', 'cliente.chronosxxi.com', false],
        ['CN-05', 'CI2 dominio sin punto', 'cliente@chronosxxi', false],
        ['CN-06', 'CI3 con espacio', 'cli ente@chronosxxi.com', false],
        ['CN-07', 'CI4 parte local vacía (límite 0)', '@chronosxxi.com', false],
        ['CN-08', 'CI5 extensión vacía (límite 0)', 'cliente@chronosxxi.', false],
        ['CN-09', 'CI6 dos arrobas', 'a@b@chronosxxi.com', false],
        ['CN-10', 'CI7 cadena vacía', '', false]
    ])('%s (%s): validateEmail(%p) devuelve %p', (_id, _clase, email, esperado) => {
        // Arrange: entrada de la tabla

        // Act
        const resultado = auth.validateEmail(email);

        // Assert
        expect(resultado).toBe(esperado);
    });
});

// ---------------------------------------------------------------------------
// F2. calculateSummary(subtotal) – RF07 Resumen de compra (IVA 19 %, envío)
// Clases: CV1 subtotal < 200.000 → envío $15.000 · CV2 subtotal ≥ 200.000 → envío gratis
// Límites: 0 · 1 · 199.999 · 200.000 · 200.001
// ---------------------------------------------------------------------------
describe('F2 calculateSummary – envío gratis desde $200.000', () => {
    let cart;
    beforeEach(() => {
        cart = loadScript('cart.js');
    });

    test.each([
        ['CN-11', 'CV1 límite inferior', 0, 0, 15000, 15000],
        ['CN-12', 'CV1 justo encima del límite inferior', 1, 0, 15000, 15001],
        ['CN-13', 'CV1 representante', 100000, 19000, 15000, 134000],
        ['CN-14', 'CV1 límite superior (199.999)', 199999, 38000, 15000, 252999],
        ['CN-15', 'CV2 límite inferior (200.000)', 200000, 38000, 0, 238000],
        ['CN-16', 'CV2 justo encima del límite (200.001)', 200001, 38000, 0, 238001],
        ['CN-17', 'CV2 representante (precio real del catálogo)', 23999000, 4559810, 0, 28558810]
    ])('%s (%s): subtotal %p → IVA %p, envío %p, total %p', (_id, _clase, subtotal, iva, envio, total) => {
        // Act
        const resumen = cart.calculateSummary(subtotal);

        // Assert
        expect(resumen).toEqual({ subtotal, tax: iva, shipping: envio, total });
    });
});

// ---------------------------------------------------------------------------
// F3. updateQuantity(id, cantidad) – RF06 Modificar cantidades (máx. 10 unidades)
// Clases: CV1 1..10 actualiza · CV2 ≤ 0 elimina el producto
//         CI1 > 10 rechaza · CI2 no entera rechaza · CI3 producto inexistente rechaza
// Límites: -1 · 0 · 1 · 10 · 11
// ---------------------------------------------------------------------------
describe('F3 updateQuantity – límites de cantidad', () => {
    const reloj = { id: 'rangeman-solar', name: 'Rangeman Solar', brand: 'CASIO', category: 'Deportivos', price: '$1.799.000' };
    let cart;
    beforeEach(() => {
        cart = loadScript('cart.js');
        cart.addToCart(reloj);
        cart.updateQuantity(reloj.id, 3);
    });

    test.each([
        ['CN-18', 'CV2 límite (-1)', -1, true, []],
        ['CN-19', 'CV2 límite (0)', 0, true, []],
        ['CN-20', 'CV1 límite inferior (1)', 1, true, [1]],
        ['CN-21', 'CV1 representante (5)', 5, true, [5]],
        ['CN-22', 'CV1 límite superior (10)', 10, true, [10]],
        ['CN-23', 'CI1 límite (11)', 11, false, [3]],
        ['CN-24', 'CI2 no entera (1.5)', 1.5, false, [3]],
        ['CN-25', 'CI2 texto ("4")', '4', false, [3]]
    ])('%s (%s): cantidad %p → aceptada %p, carrito %p', (_id, _clase, cantidad, aceptada, cantidades) => {
        // Act
        const resultado = cart.updateQuantity(reloj.id, cantidad);

        // Assert
        expect(resultado).toBe(aceptada);
        expect(cart.getCart().map(i => i.quantity)).toEqual(cantidades);
    });

    test('CN-26 (CI3 producto inexistente): no modifica el carrito', () => {
        // Act
        const resultado = cart.updateQuantity('no-existe', 2);

        // Assert
        expect(resultado).toBe(false);
        expect(cart.getCartCount()).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// F4. Registro – longitud mínima de contraseña (6) y de nombre (3) – RF01
// Límites: contraseña 5 / 6 / 7 · nombre 2 / 3
// ---------------------------------------------------------------------------
describe('F4 registro – valores límite de longitud', () => {
    const FORM = `
        <button class="auth-tab" data-tab="login"></button>
        <div id="loginForm"></div><div id="registerForm"></div><input id="loginEmail">
        <form id="registerFormSubmit">
            <input id="registerName"><input id="registerEmail">
            <input id="registerPassword"><input id="registerConfirmPassword">
            <input type="checkbox" name="terms" checked>
            <div id="registerMessage"></div>
        </form>`;

    const registrar = (nombre, clave) => {
        document.getElementById('registerName').value = nombre;
        document.getElementById('registerEmail').value = 'nuevo@correo.com';
        document.getElementById('registerPassword').value = clave;
        document.getElementById('registerConfirmPassword').value = clave;
        document.getElementById('registerFormSubmit').dispatchEvent(new Event('submit', { cancelable: true }));
        return document.getElementById('registerMessage').className;
    };

    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = FORM;
        loadScript('auth.js');
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test.each([
        ['CN-27', 'contraseña límite inválido (5)', 'Ana', '12345', 'error'],
        ['CN-28', 'contraseña límite válido (6)', 'Ana', '123456', 'success'],
        ['CN-29', 'contraseña encima del límite (7)', 'Ana', '1234567', 'success'],
        ['CN-30', 'nombre límite inválido (2)', 'Al', '123456', 'error'],
        ['CN-31', 'nombre límite válido (3)', 'Ana', '123456', 'success']
    ])('%s (%s): nombre %p, contraseña %p → mensaje %p', (_id, _caso, nombre, clave, tipo) => {
        // Act
        const clase = registrar(nombre, clave);

        // Assert
        expect(clase).toContain(tipo);
    });
});
