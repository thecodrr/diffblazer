import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/lib/Diff.ts'),
			name: 'HtmlDiff',
			fileName: 'htmldiff',
			formats: ['es', 'umd'],
		},
		minify: false,
	},
})
