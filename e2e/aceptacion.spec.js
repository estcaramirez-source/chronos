// Pruebas de SISTEMA / ACEPTACIÓN (C5) con Playwright, en un navegador real
// (Chromium) contra el contenedor de staging. Cada escenario se deriva de un
// requisito funcional; precondiciones, pasos y resultado esperado están en
// docs/diseno-casos-de-prueba.md (tabla E2E).
const { test, expect } = require('@playwright/test');

const DEMO = { email: 'demo@chronosxxi.com', password: 'demo123' };
const abrir = (page, ruta) => page.goto(ruta, { waitUntil: 'domcontentloaded' });

async function iniciarSesion(page, { email, password } = DEMO) {
    await abrir(page, '/login.html');
    await page.fill('#loginEmail', email);
    await page.fill('#loginPassword', password);
    await page.click('#loginFormSubmit button[type="submit"]');
}

test('E2E-01 (RF02, RF05, RF07) cliente inicia sesión, agrega un reloj y ve el total con IVA y envío', async ({ page }) => {
    // Precondición: navegador limpio, cuenta demo sembrada por la aplicación
    await iniciarSesion(page);
    await expect(page.locator('#loginMessage')).toContainText('Inicio de sesión exitoso');
    await page.waitForURL('**/index.html', { waitUntil: 'domcontentloaded' });

    await abrir(page, '/clasicos.html');
    await page.click('button[onclick="handleAddToCart(\'elegance-master\')"]');
    await expect(page.locator('.cart-notification').last()).toContainText('Elegance Master agregado al carrito');

    await abrir(page, '/carrito.html');
    await expect(page.locator('.cart-item h4')).toHaveText(['Elegance Master']);
    await expect(page.locator('#subtotal')).toContainText('23.999.000');
    await expect(page.locator('#tax')).toContainText('4.559.810');
    await expect(page.locator('#shipping')).toHaveText('Gratis');
    await expect(page.locator('#total')).toContainText('28.558.810');
});

test('E2E-02 (RF02) una contraseña incorrecta muestra error y no abre sesión', async ({ page }) => {
    await iniciarSesion(page, { email: DEMO.email, password: 'clave-equivocada' });

    await expect(page.locator('#loginMessage')).toHaveText('Correo o contraseña incorrectos');
    await expect(page).toHaveURL(/login\.html$/);
    const sesion = await page.evaluate(() => sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser'));
    expect(sesion).toBeNull();
});

test('E2E-03 (RF01, RF02) un visitante se registra y luego inicia sesión con su cuenta', async ({ page }) => {
    const nuevo = { nombre: 'Cliente Prueba', email: `cliente.${Date.now()}@correo.com`, password: 'Reloj2026' };
    await abrir(page, '/login.html');

    await page.click('.auth-tab[data-tab="register"]');
    await page.fill('#registerName', nuevo.nombre);
    await page.fill('#registerEmail', nuevo.email);
    await page.fill('#registerPassword', nuevo.password);
    await page.fill('#registerConfirmPassword', nuevo.password);
    await page.check('input[name="terms"]');
    await page.click('#registerFormSubmit button[type="submit"]');
    await expect(page.locator('#registerMessage')).toContainText('Cuenta creada exitosamente');

    // La aplicación vuelve sola a la pestaña de login con el correo precargado
    await expect(page.locator('#loginEmail')).toHaveValue(nuevo.email, { timeout: 5000 });
    await page.fill('#loginPassword', nuevo.password);
    await page.click('#loginFormSubmit button[type="submit"]');
    await page.waitForURL('**/index.html', { waitUntil: 'domcontentloaded' });

    const sesion = await page.evaluate(() => JSON.parse(sessionStorage.getItem('currentUser')));
    expect(sesion).toMatchObject({ name: nuevo.nombre, email: nuevo.email });
});

test('E2E-04 (RF06) el carrito no permite más de 10 unidades de un mismo reloj', async ({ page }) => {
    await iniciarSesion(page);
    await page.waitForURL('**/index.html', { waitUntil: 'domcontentloaded' });
    await abrir(page, '/deportivos.html');
    await page.click('button[onclick="handleAddToCart(\'g-shock-mudmaster\')"]');

    await abrir(page, '/carrito.html');
    const mas = page.locator('.qty-btn.plus');
    for (let i = 0; i < 9; i++) {
        await mas.click();
    }

    await expect(page.locator('.cart-item-quantity input')).toHaveValue('10');
    await expect(page.locator('.qty-btn.plus')).toBeDisabled();
    await expect(page.locator('.cart-badge').first()).toHaveText('10');
});

test('E2E-05 (RF10, regresión DEF-03) en Garantías se puede seleccionar un plan', async ({ page }) => {
    const errores = [];
    page.on('pageerror', e => errores.push(e.message));
    await abrir(page, '/garantia.html');

    await page.locator('.btn-select-warranty').first().click();

    await expect(page.locator('#selected-plan')).toBeVisible();
    await expect(page.locator('.plan-name')).not.toHaveText('');
    await expect(page.locator('.btn-select-warranty').first()).toContainText('Plan Seleccionado');
    expect(errores).toEqual([]);
});
