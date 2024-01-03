import { expect, it } from 'vitest'
import { tokenizeHtml } from '../src/lib/Tokenizer'

it('style tag is ignored', () => {
	expect(
		tokenizeHtml('<style>hello what is this new tag # . ! ( ) word </style>', ['head', 'style', 'script']),
	).toHaveLength(1)
})

it('script tag is ignored', () => {
	expect(
		tokenizeHtml('<script>hello what is this new tag # . ! ( ) word </script>', ['head', 'style', 'script']),
	).toHaveLength(1)
})

it('head with multiple nested tags is ignored', () => {
	expect(
		tokenizeHtml(
			`<head>
				<title>hello</title>
				<script>hello what is this new tag # . ! ( ) word </script>
				<style>hello what is this new tag # . ! ( ) word </style>
			</head>`,
			['head', 'style', 'script'],
		),
	).toHaveLength(1)
})
