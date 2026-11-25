// Configuración de análisis estático (ESLint 9, formato "flat config").
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: ['node_modules/**', 'coverage/**', 'reports/**']
    },
    js.configs.recommended,
    {
        // Código de la aplicación: scripts clásicos de navegador (sin módulos ES).
        files: ['PAGINA-WED-CHRONOS-XXI V2.1/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                module: 'readonly'
            }
        },
        rules: {
            // Las funciones globales se invocan desde atributos onclick del HTML,
            // por eso solo se revisan variables locales sin uso.
            'no-unused-vars': ['error', { vars: 'local', args: 'none' }],
            eqeqeq: ['error', 'always'],
            // B2: complejidad ciclomática máxima por función
            complexity: ['error', 10],
            'no-var': 'error'
        }
    },
    {
        // Pruebas, configuración y scripts de CI (Node.js / CommonJS).
        files: ['tests/**/*.js', 'scripts/**/*.js', '*.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.jest,
                ...globals.browser
            }
        }
    }
];
