import { describe, it, expect } from 'vitest'
import HtmlDiff from '../src/lib/Diff'
import { minify } from 'html-minifier'
function html(source: TemplateStringsArray) {
	return minify(source.join(''), { collapseWhitespace: true, decodeEntities: true, html5: true }).replace(
		/>\s+</gm,
		'><',
	)
}

describe('Adding tags', function () {
	it('should be reported when adding new tags in the middle', function () {
		var html1 = html`<div><b>1</b> <strong>2</strong></div>`
		var html2 = html`<div><b>1</b> <i>new</i> <strong>2</strong></div>`
		var d = HtmlDiff.execute(html1, html2)
		expect(d).toMatchSnapshot()
	})

	it('should be reported when adding new tags at the end', function () {
		var html1 = html`<div><b>1</b> <strong>2</strong></div>`
		var html2 = html`<div><b>1</b> <strong>2</strong> <i>new</i></div>`
		var d = HtmlDiff.execute(html1, html2)
		expect(d).toMatchSnapshot()
	})

	it('should be reported when adding new tags at the start', function () {
		var html1 = html`<div><b>1</b> <strong>2</strong></div>`
		var html2 = html`<div><i>new</i> <b>1</b> <strong>2</strong></div>`
		var d = HtmlDiff.execute(html1, html2)
		expect(d).toMatchSnapshot()
	})
})

describe('Removing tags', function () {
	it('should be reported when removing tags in the middle', function () {
		var html1 = html`<div><b>1</b> <i>removed</i> <strong>2</strong></div>`
		var html2 = html`<div><b>1</b> <strong>2</strong></div>`
		var d = HtmlDiff.execute(html1, html2)
		expect(d).toMatchSnapshot()
	})

	it('should be reported when removing tags at the end', function () {
		var html1 = html`<div><b>1</b> <strong>2</strong> <i>removed</i></div>`
		var html2 = html`<div><b>1</b> <strong>2</strong></div>`
		var d = HtmlDiff.execute(html1, html2)
		expect(d).toMatchSnapshot()
	})

	it('should be reported when removing tags at the start', function () {
		var html1 = html`<div><i>removed</i> <b>1</b> <strong>2</strong></div>`
		var html2 = html`<div><b>1</b> <strong>2</strong></div>`
		var d = HtmlDiff.execute(html1, html2)
		expect(d).toMatchSnapshot()
	})
})

describe('Multiple additions/removals', function () {
	it('should be correctly recognized', function () {
		var html1 = html`<div id="multi">
			<b>1</b> <br />
			<i>2</i>
			<p>3</p>
			<b>4</b> <a>5</a>
		</div>`
		var html2 = html`<div id="multi">
			<a>added</a> <b>1</b> <i>2</i> <strong>Hello</strong> <em>Hi!</em>
			<p>3</p>
			<b>4</b> <a>5</a> <em>Done.</em>
		</div>`
		var d = HtmlDiff.execute(html1, html2)
		expect(d).toMatchSnapshot()
	})

	it('multiple paragraphs', function () {
		var html1 = html`<div id="multi">
			<b>1</b> <br />
			<i>2</i>
			<p>3</p>
			<b>4</b> <a>5</a>
		</div>`
		var html2 = html`<div id="multi">
			<a>added</a> <b>1</b> <i>2</i> <strong>Hello</strong> <em>Hi!</em>
			<p>3</p>
			<b>4</b> <a>5</a> <em>Done.</em>
		</div>`
		var d = HtmlDiff.execute(html1, html2)
		expect(d).toMatchSnapshot()
	})
})
