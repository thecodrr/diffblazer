import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

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
	plugins: [dts()],
})
