import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/lib/diff.js'),
			name: 'HtmlDiff',
			formats: ['es', 'umd'],
		},
		minify: false,
	},
})
