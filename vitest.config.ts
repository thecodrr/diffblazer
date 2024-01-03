import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		coverage: {
			exclude: ['**/*.bench.ts', '**/*.d.ts'],
		},
	},
})
