// Genera la retroalimentación del pipeline a partir de los reportes de Jest:
//  - Tabla Markdown en el resumen del job ($GITHUB_STEP_SUMMARY).
//  - coverage/coverage-comment.md, que el workflow publica como comentario en el PR.
//  - Anotaciones ::notice visibles en la ejecución (y en la API pública de checks).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
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

lines.push('', `_Commit ${process.env.GITHUB_SHA || 'local'} · ejecución #${process.env.GITHUB_RUN_NUMBER || '-'}_`, '');
const markdown = lines.join('\n');

fs.mkdirSync(path.join(root, 'coverage'), { recursive: true });
fs.writeFileSync(path.join(root, 'coverage', 'coverage-comment.md'), markdown);
if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
} else {
    console.log(markdown);
}
