const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'PAGINA-WED-CHRONOS-XXI V2.1');

/**
 * Carga un script de la aplicación en un registro de módulos aislado, de modo que
 * su código de nivel superior (inicialización, listeners) se ejecute de nuevo
 * contra el DOM y el almacenamiento preparados por cada prueba.
 */
function loadScript(file) {
    let mod;
    jest.isolateModules(() => {
        mod = require(path.join(SRC_DIR, file));
    });
    return mod;
}

/** Silencia el aviso "Not implemented: navigation" de jsdom al asignar location.href. */
function silenceNavigation() {
    return jest.spyOn(console, 'error').mockImplementation(() => {});
}

function resetEnvironment() {
    localStorage.clear();
    sessionStorage.clear();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    delete window.authSystem;
    delete window.cartSystem;
    delete window.handleAddToCart;
}

module.exports = { SRC_DIR, loadScript, silenceNavigation, resetEnvironment };
