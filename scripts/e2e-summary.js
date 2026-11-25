// Resume el resultado de cada escenario E2E (resultado obtenido) como anotación y en el resumen del job.
const fs = require('fs');
const path = require('path');

const ANSI_COLORS = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const file = path.join(__dirname, '..', 'reports', 'e2e-results.json');
if (!fs.existsSync(file)) {
    console.log('::warning title=E2E::No se encontró reports/e2e-results.json');
    process.exit(0);
}

const report = JSON.parse(fs.readFileSync(file, 'utf8'));
const specs = [];
const walk = (suite) => {
    (suite.specs || []).forEach(spec => {
        const result = spec.tests[0] && spec.tests[0].results[spec.tests[0].results.length - 1];
        specs.push({
            title: spec.title,
            status: result ? result.status : 'skipped',
            seconds: result ? (result.duration / 1000).toFixed(1) : '0',
            error: result && result.error ? String(result.error.message || '').split('\n')[0].replace(ANSI_COLORS, '') : ''
        });
    });
    (suite.suites || []).forEach(walk);
};
report.suites.forEach(walk);

const md = [
    '### Pruebas de aceptación E2E (Playwright · Chromium · staging)',
    '',
    '| Escenario | Resultado obtenido | Duración |',
    '|---|---|---|',
    ...specs.map(s => `| ${s.title} | ${s.status === 'passed' ? '✅ passed' : `❌ ${s.status}: ${s.error}`} | ${s.seconds} s |`),
    ''
].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
specs.forEach(s => {
    const level = s.status === 'passed' ? 'notice' : 'error';
    console.log(`::${level} title=E2E ${s.status}::${s.title} (${s.seconds} s)${s.error ? ' -> ' + s.error : ''}`);
});
