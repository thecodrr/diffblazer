import { expect, it } from 'vitest'
import HtmlDiff from '../src/lib/Diff'

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
		const result = HtmlDiff.execute(testCase.oldText, testCase.newText)
		expect(result).toBe(testCase.expected)
	}
})

// it('with group candididates and grouping configured', () => {
// 	function TestCase(oldText: any, newText: string, groupExpression: RegExp | null, expected: string) {
// 		return { oldText, newText, groupExpression, expected }
// 	}

// 	const testCases = [
// 		// Shamelessly copied specs from here with a few modifications: https://github.com/myobie/htmldiff/blob/master/spec/htmldiff_spec.rb

// 		[
// 			TestCase(
// 				'This is a date 1 Jan 2016 that will change',
// 				'This is a date 22 Feb 2017 that did change',
// 				/[\d]{1,2}[\s]*(Jan|Feb)[\s]*[\d]{4}/g,
// 				"This is a date<del class='diffmod'> 1 Jan 2016</del><ins class='diffmod'> 22 Feb 2017</ins> that <del class='diffmod'>will</del><ins class='diffmod'>did</ins> change",
// 			),
// 		],
// 		[
// 			TestCase(
// 				'This is a date 1 Jan 2016 that will change',
// 				"This is a date 22 Feb 2017 that won't change",
// 				null,
// 				"This is a date <del class='diffmod'>1</del><ins class='diffmod'>22</ins> <del class='diffmod'>Jan</del><ins class='diffmod'>Feb</ins> <del class='diffmod'>2016</del><ins class='diffmod'>2017</ins> that <del class='diffmod'>will</del><ins class='diffmod'>won't</ins> change",
// 			),
// 		],
// 	]

// 	for (const [testCase] of testCases) {
// 		// const result = HtmlDiff.execute(testCase.oldText, testCase.newText)
// 		const diff = new HtmlDiff(testCase.oldText, testCase.newText)
// 		if (testCase.groupExpression) diff.addBlockExpression(testCase.groupExpression)

// 		const result = diff.build()

// 		expect(result).toBe(testCase.expected)
// 	}
// })
