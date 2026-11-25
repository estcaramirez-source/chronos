// Pruebas de scripts.js (comportamiento de interfaz común a todas las páginas).
// Incluye la prueba de regresión del defecto DEF-03: el script fallaba en las
// páginas que no tienen formulario de contacto (todas excepto index.html).
const { loadScript, resetEnvironment } = require('./helpers');

// Doble de prueba tipo FAKE: implementación simplificada pero funcional de
// IntersectionObserver (jsdom no la trae) que permite disparar las intersecciones.
let observers;
class FakeIntersectionObserver {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.targets = [];
        observers.push(this);
    }
    observe(target) {
        this.targets.push(target);
    }
    trigger(entries) {
        this.callback(entries);
    }
}

const NAV = `
    <nav class="navbar">
        <div class="logo"><a href="index.html"><h1>CHRONOS XXI</h1></a></div>
        <ul class="nav-menu"><li><a href="#productos">Productos</a></li><li><a href="#no-existe">Otro</a></li></ul>
        <div class="hamburger"></div>
    </nav>`;

const INDEX = `${NAV}
    <section id="productos"></section>
    <div class="producto-card"></div>
    <form class="contacto-form"><input name="nombre" value="Ana"></form>
    <section class="stats-section">
        <div class="stat-box"><h3>500+</h3></div>
        <div class="stat-box"><h3>15</h3></div>
    </section>
    <div class="category-tags"><span class="tag">Suizo</span><span class="tag">Automático</span></div>
    <span class="commit-number">1</span>`;

const GARANTIA = `${NAV}
    <section class="warranty-types">
        <div class="warranty-card selectable-warranty">
            <h3>Garantía Extendida</h3><p class="warranty-duration">+2 años adicionales</p>
            <button class="btn-select-warranty" data-plan="extendida" data-price="399000">Seleccionar</button>
        </div>
        <div class="warranty-card selectable-warranty">
            <h3>Garantía Premium</h3><p class="warranty-duration">+3 años con cobertura ampliada</p>
            <button class="btn-select-warranty" data-plan="premium" data-price="699000">Seleccionar</button>
        </div>
    </section>
    <div id="selected-plan" style="display:none">
        <span class="plan-name"></span><span class="plan-description"></span><span class="price-amount"></span>
        <button class="btn-change-plan">Cambiar plan</button>
    </div>`;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

beforeEach(() => {
    jest.useFakeTimers();
    resetEnvironment();
    observers = [];
    window.IntersectionObserver = FakeIntersectionObserver;
    window.scrollTo = jest.fn();
    window.alert = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

describe('regresión DEF-03: páginas sin formulario de contacto', () => {
    test('el script carga sin errores en una página que solo tiene la barra de navegación', () => {
        // Arrange
        document.body.innerHTML = NAV;

        // Act
        const cargar = () => loadScript('scripts.js');

        // Assert
        expect(cargar).not.toThrow();
    });

    test('el script carga sin errores en una página sin barra de navegación', () => {
        // Arrange
        document.body.innerHTML = '<main>Contenido</main>';

        // Act
        const cargar = () => loadScript('scripts.js');

        // Assert
        expect(cargar).not.toThrow();
    });

    test('en garantia.html seleccionar un plan muestra su nombre, duración y precio', () => {
        // Arrange
        document.body.innerHTML = GARANTIA;
        loadScript('scripts.js');
        const [, premium] = $$('.btn-select-warranty');

        // Act
        premium.click();

        // Assert
        expect($('#selected-plan').style.display).toBe('block');
        expect($('.plan-name').textContent).toBe('Garantía Premium');
        expect($('.plan-description').textContent).toBe('+3 años con cobertura ampliada');
        expect($('.price-amount').textContent).toMatch(/699\.000/);
        expect(premium.closest('.warranty-card').classList.contains('selected')).toBe(true);
        expect(premium.textContent).toContain('Plan Seleccionado');
        expect($$('.btn-select-warranty')[0].textContent).toContain('Seleccionar Plan');
    });

    test('en garantia.html "Cambiar plan" oculta la selección y restaura los botones', () => {
        // Arrange
        document.body.innerHTML = GARANTIA;
        loadScript('scripts.js');
        $$('.btn-select-warranty')[0].click();

        // Act
        $('.btn-change-plan').click();

        // Assert
        expect($('#selected-plan').style.display).toBe('none');
        expect($$('.selectable-warranty.selected')).toHaveLength(0);
        $$('.btn-select-warranty').forEach(b => expect(b.textContent).toContain('Seleccionar Plan'));
    });
});

describe('navegación', () => {
    beforeEach(() => {
        document.body.innerHTML = INDEX;
        loadScript('scripts.js');
    });

    test('el botón hamburguesa abre y cierra el menú y actualiza aria-expanded', () => {
        // Act
        $('.hamburger').click();

        // Assert
        expect($('.nav-menu').classList.contains('active')).toBe(true);
        expect($('.hamburger').getAttribute('aria-expanded')).toBe('true');

        // Act
        $('.hamburger').click();

        // Assert
        expect($('.nav-menu').classList.contains('active')).toBe(false);
        expect($('.hamburger').getAttribute('aria-expanded')).toBe('false');
    });

    test('hacer clic en un enlace del menú lo cierra', () => {
        // Arrange
        $('.hamburger').click();

        // Act
        $('.nav-menu a').click();

        // Assert
        expect($('.nav-menu').classList.contains('active')).toBe(false);
    });

    test('un enlace interno hace scroll suave descontando la barra fija (70 px)', () => {
        // Act
        $('a[href="#productos"]').click();

        // Assert
        expect(window.scrollTo).toHaveBeenCalledWith({ top: -70, behavior: 'smooth' });
    });

    test('un enlace interno a una sección inexistente no hace scroll', () => {
        // Act
        $('a[href="#no-existe"]').click();

        // Assert
        expect(window.scrollTo).not.toHaveBeenCalled();
    });

    test.each([
        [150, 'rgba(0, 0, 0, 0.98)'],
        [100, 'rgba(0, 0, 0, 0.95)']
    ])('con scroll de %p px la barra usa fondo %p', (posicion, color) => {
        // Arrange
        Object.defineProperty(window, 'pageYOffset', { value: posicion, configurable: true });

        // Act
        window.dispatchEvent(new Event('scroll'));

        // Assert
        expect($('.navbar').style.backgroundColor).toBe(color);
    });

    test('el logo se agranda al pasar el mouse y vuelve a su tamaño al salir', () => {
        // Act + Assert
        $('.logo h1').dispatchEvent(new Event('mouseenter'));
        expect($('.logo h1').style.transform).toBe('scale(1.05)');
        $('.logo h1').dispatchEvent(new Event('mouseleave'));
        expect($('.logo h1').style.transform).toBe('scale(1)');
    });
});

describe('animaciones y formulario de la página principal', () => {
    beforeEach(() => {
        document.body.innerHTML = INDEX;
        loadScript('scripts.js');
    });

    test('las tarjetas aparecen solo cuando entran en pantalla', () => {
        // Arrange
        const card = $('.producto-card');
        const [cardsObserver] = observers;
        expect(card.style.opacity).toBe('0');

        // Act
        cardsObserver.trigger([{ isIntersecting: false, target: card }]);
        const antes = card.style.opacity;
        cardsObserver.trigger([{ isIntersecting: true, target: card }]);

        // Assert
        expect(antes).toBe('0');
        expect(card.style.opacity).toBe('1');
        expect(card.style.transform).toBe('translateY(0)');
    });

    test('el formulario de contacto confirma el envío y se limpia', () => {
        // Arrange
        const form = $('.contacto-form');
        form.querySelector('input').value = 'Texto escrito';

        // Act
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        // Assert
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Gracias por tu mensaje'));
        expect(form.querySelector('input').value).toBe('Ana');
    });

    test('las estadísticas cuentan hasta su valor una sola vez', () => {
        // Arrange
        const statsObserver = observers[1];
        const seccion = $('.stats-section');

        // Act
        statsObserver.trigger([{ isIntersecting: true, target: seccion }]);
        jest.advanceTimersByTime(30 * 10);
        const parcial = $$('.stat-box h3')[0].textContent;
        jest.advanceTimersByTime(30 * 60);
        statsObserver.trigger([{ isIntersecting: true, target: seccion }]);

        // Assert
        expect(parcial).not.toBe('500+');
        expect($$('.stat-box h3').map(h => h.textContent)).toEqual(['500+', '15']);
        expect(seccion.classList.contains('counted')).toBe(true);
    });

    test('las etiquetas de categoría aparecen escalonadas', () => {
        // Arrange
        const tags = $$('.tag');
        expect(tags.map(t => t.style.opacity)).toEqual(['0', '0']);

        // Act
        jest.advanceTimersByTime(100);

        // Assert
        expect(tags.map(t => t.style.opacity)).toEqual(['1', '1']);
    });

    test('los números de compromiso rotan al pasar el mouse', () => {
        // Arrange
        const numero = $('.commit-number');

        // Act + Assert
        numero.dispatchEvent(new Event('mouseenter'));
        expect(numero.style.transform).toBe('scale(1.2) rotate(5deg)');
        numero.dispatchEvent(new Event('mouseleave'));
        expect(numero.style.transform).toBe('scale(1) rotate(0)');
    });
});
