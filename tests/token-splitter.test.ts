import { expect, it, describe } from 'vitest'
import { tokenizeHtml } from '../src/lib/Tokenizer'

describe('tokenize html', function () {
	describe('when called with text', function () {
		it('should return 7', function () {
			expect(tokenizeHtml('this is a test').length).to.equal(7)
		})
	})

	describe('when called with html', function () {
		const html = '<p>this is a <strong>test</strong></p>'

		it('should return 11', function () {
			expect(tokenizeHtml(html).length).to.equal(11)
		})

		it('should remove any html comments', function () {
			const html = '<p> this is <!-- a comment! --> </p>'
			expect(tokenizeHtml(html).length).to.equal(8)
		})
	})

	it('should identify contiguous whitespace as a single token', function () {
		expect(tokenizeHtml('a           b')).toMatchSnapshot()
	})

	it('should identify a single space as a single token', function () {
		expect(tokenizeHtml(' a b ')).toMatchSnapshot()
	})

	it('should identify self closing tags as tokens', function () {
		expect(tokenizeHtml('<p>hello</br>goodbye</p>')).toMatchSnapshot()
	})

	describe('when encountering atomic tags', function () {
		it('should identify an image tag as a single token', function () {
			expect(tokenizeHtml('<p><img src="1.jpg"><img src="2.jpg"></p>', ['img'])).toMatchSnapshot()
		})

		it('should identify an iframe tag as a single token', function () {
			expect(tokenizeHtml('<p><iframe src="sample.html"></iframe></p>')).toMatchSnapshot()
		})

		it('should identify an object tag as a single token', function () {
			expect(tokenizeHtml('<p><object><param name="1" /><param name="2" /></object></p>')).toMatchSnapshot()
		})

		it('should identify a math tag as a single token', function () {
			expect(
				tokenizeHtml(
					'<p><math xmlns="http://www.w3.org/1998/Math/MathML">' +
						'<mi>&#x03C0;<!-- π --></mi>' +
						'<mo>&#x2062;<!-- &InvisibleTimes; --></mo>' +
						'<msup><mi>r</mi><mn>2</mn></msup></math></p>',
				),
			).toMatchSnapshot()
		})

		it('should identify an svg tag as a single token', function () {
			expect(
				tokenizeHtml(
					'<p><svg width="100" height="100">' +
						'<circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" ' +
						'fill="yellow" /></svg></p>',
				),
			).toMatchSnapshot()
		})

		it('should identify a script tag as a single token', function () {
			expect(tokenizeHtml('<p><script>console.log("hi");</script></p>')).toMatchSnapshot()
		})

		it('should identify style tag as a single token', () => {
			expect(tokenizeHtml('<style>hello what is this new tag # . ! ( ) word </style>')).toMatchSnapshot()
		})

		it('should identify head tag as a single token', () => {
			expect(
				tokenizeHtml(
					`<head>
						<title>hello</title>
						<script>hello what is this new tag # . ! ( ) word </script>
						<style>hello what is this new tag # . ! ( ) word </style>
					</head>`,
				),
			).toMatchSnapshot()
		})
	})
})
