export default {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.svg$': '<rootDir>/src/__mocks__/fileMock.ts'
	},
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json'
			}
		]
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
		'<rootDir>/src/**/*.(test|spec).(ts|tsx|js)'
	],
	collectCoverageFrom: [
		'src/**/*.(ts|tsx)',
		'!src/**/*.d.ts',
		'!src/demo/**',
		'!src/setupTests.ts'
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html']
};
