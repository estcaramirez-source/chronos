// Configuración de pruebas unitarias y umbral de calidad (quality gate) de cobertura.
// Si la cobertura global queda por debajo de estos valores, `jest` termina con código 1
// y el pipeline de CI falla.
module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    clearMocks: true,
    restoreMocks: true,
    collectCoverageFrom: [
        'PAGINA-WED-CHRONOS-XXI V2.1/{auth,cart,products}.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary', 'cobertura'],
    coverageThreshold: {
        global: {
            lines: 80,
            statements: 80,
            functions: 80,
            branches: 70
        }
    },
    reporters: [
        'default',
        ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }]
    ]
};
