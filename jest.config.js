// Configuración de pruebas unitarias y umbral de calidad (quality gate) de cobertura.
// Si la cobertura global queda por debajo de estos valores, `jest` termina con código 1
// y el pipeline de CI falla.
module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    clearMocks: true,
    restoreMocks: true,
    collectCoverageFrom: [
        'PAGINA-WED-CHRONOS-XXI V2.1/{auth,cart,products,scripts}.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'text-summary', 'lcov', 'json', 'json-summary', 'cobertura'],
    coverageThreshold: {
        global: {
            lines: 95,
            statements: 95,
            functions: 95,
            branches: 95
        }
    },
    reporters: [
        'default',
        ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }]
    ]
};
