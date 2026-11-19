#!/usr/bin/env bash
# Pruebas de humo posteriores al despliegue en staging.
# Uso: bash scripts/smoke-test.sh http://localhost:8080
set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"
FAILED=0

echo "Esperando a que staging responda en ${BASE_URL} ..."
curl --silent --fail --retry 15 --retry-connrefused --retry-delay 1 -o /dev/null "${BASE_URL}/"

check_status() {
    local path="$1"
    local code
    code=$(curl --silent --output /dev/null --write-out '%{http_code}' "${BASE_URL}/${path}")
    if [ "${code}" = "200" ]; then
        echo "OK   200  /${path}"
    else
        echo "::error title=Smoke test::/${path} respondió ${code}"
        FAILED=1
    fi
}

check_content() {
    local path="$1" expected="$2"
    # grep sin -q lee toda la entrada: evita SIGPIPE en curl con `set -o pipefail`.
    if curl --silent "${BASE_URL}/${path}" | grep "${expected}" > /dev/null; then
        echo "OK   /${path} contiene '${expected}'"
    else
        echo "::error title=Smoke test::/${path} no contiene '${expected}'"
        FAILED=1
    fi
}

# 1. Todas las páginas y recursos críticos responden 200
for page in index.html login.html carrito.html clasicos.html tecnologicos.html deportivos.html \
            reparacion.html mantenimiento.html garantia.html \
            style.css scripts.js auth.js cart.js products.js \
            imagenes/Logo_relog.png imagenes/Banner_clasico.jpg version.json; do
    check_status "${page}"
done

# 2. Contenido mínimo esperado
check_content "" "CHRONOS"
check_content "login.html" "loginFormSubmit"
check_content "carrito.html" "checkoutBtn"
check_content "products.js" "productsDatabase"
check_content "version.json" "\"environment\": \"staging\""

# 3. Una ruta inexistente debe responder 404 (el servidor no expone listados)
code=$(curl --silent --output /dev/null --write-out '%{http_code}' "${BASE_URL}/no-existe.html")
if [ "${code}" = "404" ]; then echo "OK   404  /no-existe.html"; else echo "::error title=Smoke test::/no-existe.html respondió ${code}"; FAILED=1; fi

if [ "${FAILED}" -ne 0 ]; then
    echo "Pruebas de humo FALLIDAS"
    exit 1
fi
echo "Pruebas de humo superadas"
