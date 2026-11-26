// Reporte de complejidad ciclomática por función (B2).
// Usa la regla `complexity` de ESLint con umbral 0 para que informe TODAS las
// funciones, y genera reports/complexity.md / complexity.json. El límite real
// (≤ 10) lo aplica `npm run lint` mediante eslint.config.js.
const fs = require('fs');
const path = require('path');
const { ESLint } = require('eslint');

const UMBRAL = 10;
const root = path.join(__dirname, '..');

async function main() {
    const eslint = new ESLint({
        cwd: root,
        overrideConfig: { rules: { complexity: ['warn', 0] } }
    });
    const results = await eslint.lintFiles(['PAGINA-WED-CHRONOS-XXI V2.1/*.js']);

    const funciones = results.flatMap(r => r.messages
        .filter(m => m.ruleId === 'complexity')
        .map(m => ({
            archivo: path.basename(r.filePath),
            linea: m.line,
            funcion: m.message.split(' has a complexity')[0],
            complejidad: Number((m.message.match(/complexity of (\d+)/) || [])[1])
        })))
        .sort((a, b) => b.complejidad - a.complejidad || a.archivo.localeCompare(b.archivo) || a.linea - b.linea);

    const superan = funciones.filter(f => f.complejidad > UMBRAL);
    const promedio = funciones.reduce((s, f) => s + f.complejidad, 0) / funciones.length;

    const md = [
        '### Complejidad ciclomática (ESLint `complexity`)',
        '',
        `Funciones analizadas: **${funciones.length}** · promedio **${promedio.toFixed(2)}** · ` +
        `máxima **${funciones[0].complejidad}** · umbral **≤ ${UMBRAL}** · superan el umbral: **${superan.length}**`,
        '',
        '| # | Archivo | Línea | Función | V(G) |',
        '|---|---|---|---|---|',
        ...funciones.map((f, i) => `| ${i + 1} | ${f.archivo} | ${f.linea} | ${f.funcion} | ${f.complejidad} |`),
        ''
    ].join('\n');

    fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
    fs.writeFileSync(path.join(root, 'reports', 'complexity.md'), md);
    fs.writeFileSync(path.join(root, 'reports', 'complexity.json'), JSON.stringify({ umbral: UMBRAL, promedio, funciones }, null, 2));
    if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
    } else {
        console.log(md);
    }

    const top = funciones.slice(0, 5).map(f => `${f.archivo}:${f.linea} ${f.funcion}=${f.complejidad}`).join(' | ');
    console.log(`::notice title=Complejidad::${funciones.length} funciones, promedio ${promedio.toFixed(2)}, máx ${funciones[0].complejidad}, >${UMBRAL}: ${superan.length}. Top: ${top}`);

    if (superan.length > 0) {
        superan.forEach(f => console.log(`::error file=PAGINA-WED-CHRONOS-XXI V2.1/${f.archivo},line=${f.linea},title=Complejidad::${f.funcion} = ${f.complejidad} (> ${UMBRAL})`));
        process.exitCode = 1;
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
