// Genera la retroalimentación del pipeline a partir de los reportes de Jest:
//  - Tabla Markdown en el resumen del job ($GITHUB_STEP_SUMMARY).
//  - coverage/coverage-comment.md, que el workflow publica como comentario en el PR.
//  - Anotaciones ::notice visibles en la ejecución (y en la API pública de checks).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
// Códigos de color ANSI (ESC[...m) que Jest incluye en los mensajes de error.
const ANSI_COLORS = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const readJson = (rel) => {
    const file = path.join(root, rel);
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
};

const coverage = readJson('coverage/coverage-summary.json');
const results = readJson('reports/jest-results.json');
const { global: thresholds } = require('../jest.config.js').coverageThreshold;

const lines = ['<!-- chronos-ci-report -->', '### Reporte de CI - CHRONOS XXI', ''];

if (results) {
    const icon = results.success ? '✅' : '❌';
    lines.push(
        `**Pruebas:** ${icon} ${results.numPassedTests}/${results.numTotalTests} aprobadas ` +
        `(${results.numFailedTests} fallidas) en ${results.numTotalTestSuites} suites.`,
        ''
    );
    console.log(`::notice title=Pruebas::${results.numPassedTests}/${results.numTotalTests} aprobadas, ${results.numFailedTests} fallidas`);

    // Cada prueba fallida se reporta como anotación de error y en la tabla del resumen.
    const fallidas = results.testResults.flatMap(suite =>
        suite.assertionResults
            .filter(a => a.status === 'failed')
            .map(a => ({
                file: path.relative(root, suite.name).replace(/\\/g, '/'),
                name: a.fullName,
                detail: (a.failureMessages[0] || '')
                    .replace(ANSI_COLORS, '')
                    .split('\n').map(l => l.trim()).filter(Boolean).slice(0, 4).join(' | ')
            }))
    );
    if (fallidas.length) {
        lines.push('**Pruebas fallidas:**', '');
        fallidas.forEach(f => {
            lines.push(`- \`${f.file}\` › ${f.name}`);
            console.log(`::error file=${f.file},title=Prueba fallida::${f.name} -> ${f.detail}`);
        });
        lines.push('');
    }
}

if (coverage) {
    lines.push('| Métrica | Cobertura | Umbral | Estado |', '|---|---|---|---|');
    const resumen = [];
    for (const metric of ['lines', 'statements', 'functions', 'branches']) {
        const pct = coverage.total[metric].pct;
        const min = thresholds[metric];
        lines.push(`| ${metric} | ${pct}% | ${min}% | ${pct >= min ? '✅' : '❌'} |`);
        resumen.push(`${metric} ${pct}% (min ${min}%)`);
    }
    console.log(`::notice title=Cobertura::${resumen.join(' | ')}`);
}

// C6: detalle de lo que NO está cubierto (sentencias y ramas con 0 ejecuciones).
const detalle = readJson('coverage/coverage-final.json');
if (detalle) {
    const pendientes = [];
    for (const [archivo, data] of Object.entries(detalle)) {
        const nombre = path.basename(archivo);
        for (const [id, veces] of Object.entries(data.s)) {
            if (veces === 0) pendientes.push({ nombre, linea: data.statementMap[id].start.line, tipo: 'sentencia' });
        }
        for (const [id, conteos] of Object.entries(data.b)) {
            const rama = data.branchMap[id];
            conteos.forEach((veces, i) => {
                if (veces === 0) {
                    const loc = (rama.locations[i] && rama.locations[i].start.line) ? rama.locations[i] : rama.loc;
                    pendientes.push({ nombre, linea: loc.start.line, tipo: `rama ${rama.type} #${i + 1}` });
                }
            });
        }
    }
    pendientes.sort((a, b) => a.nombre.localeCompare(b.nombre) || a.linea - b.linea);
    lines.push('', `**Elementos sin cubrir (${pendientes.length}):**`, '');
    if (pendientes.length) {
        lines.push('| Archivo | Línea | Tipo |', '|---|---|---|', ...pendientes.map(p => `| ${p.nombre} | ${p.linea} | ${p.tipo} |`));
    } else {
        lines.push('Ninguno.');
    }
    const texto = pendientes.map(p => `${p.nombre}:${p.linea} (${p.tipo})`).join(', ') || 'ninguno';
    console.log(`::notice title=Sin cubrir::${texto}`);
}

lines.push('', `_Commit ${process.env.GITHUB_SHA || 'local'} · ejecución #${process.env.GITHUB_RUN_NUMBER || '-'}_`, '');
const markdown = lines.join('\n');

fs.mkdirSync(path.join(root, 'coverage'), { recursive: true });
fs.writeFileSync(path.join(root, 'coverage', 'coverage-comment.md'), markdown);
if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
} else {
    console.log(markdown);
}
