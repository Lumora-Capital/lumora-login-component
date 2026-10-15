import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command, mode }) => {
	// Ensure production mode for library builds
	const isProduction = mode === 'production' || process.env.NODE_ENV === 'production';
	
	return {
		mode: isProduction ? 'production' : mode,
		// public/ holds demo-only files (logo sources, screenshots): served by the dev server,
		// kept out of the library build so they do not ship in the npm package
		publicDir: command === 'build' ? false : 'public',
		plugins: [
			react({
				jsxRuntime: 'automatic',
				jsxImportSource: 'react'
			}),
			tsconfigPaths(),
			dts({
				insertTypesEntry: true,
				include: ['src/**/*'],
				exclude: ['src/**/*.test.*', 'src/**/*.spec.*']
			})
		],
		build: {
			lib: {
				entry: 'src/index.ts',
				name: 'LumoraLogin',
				formats: ['es', 'cjs'],
				fileName: format => `index.${format}.js`
			},
			rollupOptions: {
				external: [
					'react',
					'react-dom',
					'react/jsx-runtime',
					'react/jsx-dev-runtime',
					'@emotion/react',
					'@emotion/styled',
					'@mui/material',
					'@mui/icons-material',
					'react-hook-form',
					'@hookform/resolvers',
					'yup',
					'@react-oauth/google'
				],
				output: {
					globals: {
						react: 'React',
						'react-dom': 'ReactDOM',
						'react/jsx-runtime': 'jsxRuntime',
						'react/jsx-dev-runtime': 'jsxRuntime'
					}
				}
			}
		},
		// Add development server configuration
		server: {
			port: 3001,
			open: true
		}
	};
});
