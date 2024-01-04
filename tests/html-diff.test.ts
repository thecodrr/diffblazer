import { expect, it, describe } from 'vitest'
import { Diffblazer, diff } from '../src'
import { Action } from '../src/action'

it('with standard specs', () => {
	function TestCase(oldText: any, newText: string, expected: string) {
		return { oldText, newText, expected }
	}

	const testCases = [
		// Shamelessly copied specs from here with a few modifications: https://github.com/myobie/htmldiff/blob/master/spec/htmldiff_spec.rb
		[
			TestCase(
				'a word is here',
				'a nother word is there',
				"a<ins class='diffins'>&nbsp;nother</ins> word is <del class='diffmod'>here</del><ins class='diffmod'>there</ins>",
			),
		],
		[TestCase('a c', 'a b c', "a <ins class='diffins'>b </ins>c")],
		[TestCase('a b c', 'a c', "a <del class='diffdel'>b </del>c")],
		[TestCase('a b c', 'a <strong>b</strong> c', "a <strong><ins class='mod'>b</ins></strong> c")],
		[TestCase('a b c', 'a d c', "a <del class='diffmod'>b</del><ins class='diffmod'>d</ins> c")],
		[TestCase("<a title='xx'>test</a>", "<a title='yy'>test</a>", "<a title='yy'>test</a>")],
		[TestCase("<img src='logo.jpg'/>", '', "<del class='diffdel'><img src='logo.jpg'/></del>")],
		[TestCase('', "<img src='logo.jpg'/>", "<ins class='diffins'><img src='logo.jpg'/></ins>")],
		[
			TestCase(
				"symbols 'should not' belong <b>to</b> words",
				'symbols should not belong <b>"to"</b> words',
				"symbols <del class='diffdel'>'</del>should not<del class='diffdel'>'</del> belong <b><ins class='diffins'>\"</ins>to<ins class='diffins'>\"</ins></b> words",
			),
		],
		[
			TestCase(
				'entities are separate amp;words',
				'entities are&nbsp;separate &amp;words',
				"entities are<del class='diffmod'>&nbsp;</del><ins class='diffmod'>&nbsp;</ins>separate <del class='diffmod'>amp;</del><ins class='diffmod'>&amp;</ins>words",
			),
		],
		[
			TestCase(
				'This is a longer piece of text to ensure the new blocksize algorithm works',
				'This is a longer piece of text to <strong>ensure</strong> the new blocksize algorithm works decently',
				"This is a longer piece of text to <strong><ins class='mod'>ensure</ins></strong> the new blocksize algorithm works<ins class='diffins'>&nbsp;decently</ins>",
			),
		],
		[
			TestCase(
				'By virtue of an agreement between xxx and the <b>yyy schools</b>, ...',
				'By virtue of an agreement between xxx and the <b>yyy</b> schools, ...',
				'By virtue of an agreement between xxx and the <b>yyy</b> schools, ...',
			),
		],
		[
			TestCase(
				'Some plain text',
				'Some <strong><i>plain</i></strong> text',
				"Some <strong><i><ins class='mod'>plain</ins></i></strong> text",
			),
		],
		[
			TestCase(
				'Some <strong><i>formatted</i></strong> text',
				'Some formatted text',
				"Some <ins class='mod'>formatted</ins> text",
			),
		],
		[
			TestCase(
				'<table><tr><td>col1</td><td>col2</td></tr><tr><td>Data 1</td><td>Data 2</td></tr></table>',
				'<table><tr><td>col1</td><td>col2</td></tr></table>',
				"<table><tr><td>col1</td><td>col2</td></tr><tr><td><del class='diffdel'>Data 1</del></td><td><del class='diffdel'>Data 2</del></td></tr></table>",
			),
		],
		[
			TestCase(
				'text',
				'<span style="text-decoration: line-through;">text</span>',
				'<span style="text-decoration: line-through;"><ins class=\'mod\'>text</ins></span>',
			),
		],

		// TODO: Don't speak Chinese, this needs to be validated
		[
			TestCase(
				'这个是中文内容, CSharp is the bast',
				'这是中国语内容，CSharp is the best language.',
				"这<del class='diffdel'>个</del>是中<del class='diffmod'>文</del><ins class='diffmod'>国语</ins>内容<del class='diffmod'>, </del><ins class='diffmod'>，</ins>CSharp is the <del class='diffmod'>bast</del><ins class='diffmod'>best language.</ins>",
			),
		],
	]

	for (const [testCase] of testCases) {
		const result = diff(testCase.oldText, testCase.newText)
		expect(result).toBe(testCase.expected)
	}
})

function ops(before: string, after: string) {
	const res = new Diffblazer(before, after)
	res.tokenizeInputs()
	return res.operations()
}

describe('Diff', function () {
	describe('When both inputs are the same', function () {
		it('should return the text', function () {
			expect(diff('input text', 'input text')).equal('input text')
		})
	})

	describe('When a letter is added', function () {
		it('should mark the new letter', function () {
			expect(diff('input', 'input 2')).to.equal("input<ins class='diffins'>&nbsp;2</ins>")
		})
	})

	describe('Whitespace differences', function () {
		it('should collapse adjacent whitespace if ignoreWhiteSpaceDifferences is true', function () {
			expect(diff('Much \n\t    spaces', 'Much spaces', { ignoreWhiteSpaceDifferences: true })).to.equal('Much spaces')
		})

		it('should not collapse adjacent whitespace if ignoreWhiteSpaceDifferences is false', function () {
			expect(diff('Much \n\t    spaces', 'Much spaces')).to.equal(
				`Much<del class='diffmod'> \n\t    </del><ins class='diffmod'>&nbsp;</ins>spaces`,
			)
		})

		it.fails('should consider non-breaking spaces as equal', function () {
			expect(diff('Hello&nbsp;world', 'Hello&#160;world')).to.equal('Hello&#160;world')
		})

		it.fails('should consider non-breaking spaces and non-adjacent regular spaces as equal', function () {
			expect(diff('Hello&nbsp;world', 'Hello world')).to.equal('Hello world')
		})
	})

	describe('Image Differences', function () {
		it('show two images as different if their src attributes are different', function () {
			var before = '<img src="a.jpg">'
			var after = '<img src="b.jpg">'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.replace,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})

		it('should show two images are the same if their src attributes are the same', function () {
			var before = '<img src="a.jpg">'
			var after = '<img src="a.jpg" alt="hey!">'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.equal,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})

		it('should show two images are the same if they have invalid src attribute', function () {
			var before = '<img src=yxyx>'
			var after = '<img src=whwu29282>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.equal,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})
	})

	describe('Widget Differences', function () {
		it('show two widgets as different if their data attributes are different', function () {
			var before = '<object data="a.jpg"></object>'
			var after = '<object data="b.jpg"></object>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.replace,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})

		it('should show two widgets are the same if their data attributes are the same', function () {
			var before = '<object data="a.jpg"><param>yo!</param></object>'
			var after = '<object data="a.jpg"></object>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.equal,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})
	})

	describe('Math Differences', function () {
		it('should show two math elements as different if their contents are different', function () {
			var before =
				'<math data-uuid="55784cd906504787a8e459e80e3bb554"><msqrt>' +
				'<msup><mi>b</mi><mn>2</mn></msup></msqrt></math>'

			var after =
				'<math data-uuid="55784cd906504787a8e459e80e3bb554"><msqrt>' +
				'<msup><mn>b</mn><mn>5</mn></msup></msqrt></math>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.replace,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})

		it('should show two math elements as the same if their contents are the same', function () {
			var before =
				'<math data-uuid="15568cd906504876548459e80e356878"><msqrt>' +
				'<msup><mi>b</mi><mn>2</mn></msup></msqrt></math>'

			var after =
				'<math data-uuid="55784cd906504787a8e459e80e3bb554"><msqrt>' +
				'<msup><mi>b</mi><mn>2</mn></msup></msqrt></math>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.equal,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})
	})

	describe('Video Differences', function () {
		it('show two videos as different if their src attributes are different', function () {
			var before =
				'<video data-uuid="0787866ab5494d88b4b1ee423453224b">' +
				'<source src="inkling-video:///big_buck_bunny/webm_high" type="video/webm" /></video>'

			var after =
				'<video data-uuid="0787866ab5494d88b4b1ee423453224b">' +
				'<source src="inkling-video:///big_buck_rabbit/mp4" type="video/webm" /></video>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.replace,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})

		it('should show two videos as the same if their src attributes are the same', function () {
			var before =
				'<video data-uuid="65656565655487787484545454548494">' +
				'<source src="inkling-video:///big_buck_bunny/webm_high" type="video/webm" /></video>'

			var after =
				'<video data-uuid="0787866ab5494d88b4b1ee423453224b">' +
				'<source src="inkling-video:///big_buck_bunny/webm_high" type="video/webm" /></video>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.equal,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})
	})

	describe('iframe Differences', function () {
		it('show two iframes as different if their src attributes are different', function () {
			var before = '<iframe src="a.jpg"></iframe>'
			var after = '<iframe src="b.jpg"></iframe>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.replace,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})

		it('should show two iframes as the same if their src attributes are the same', function () {
			var before = '<iframe src="a.jpg"></iframe>'
			var after = '<iframe src="a.jpg" class="foo"></iframe>'

			expect(ops(before, after).length).to.equal(1)
			expect(ops(before, after)[0]).to.eql({
				action: Action.equal,
				startInOld: 0,
				endInOld: 1,
				startInNew: 0,
				endInNew: 1,
			})
		})
	})
})
