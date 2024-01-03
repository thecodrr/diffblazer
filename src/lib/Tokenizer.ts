import { Tokenizer } from 'htmlparser2'

export type TextToken = { type: 'text'; value: string; length: number }
export type TagToken = {
	type: 'tag-start' | 'tag-end' | 'tag-full'
	name: string
	raw: string
	length: number
}
export type Token = TextToken | TagToken

type TagRange = { start?: number; end?: number; nameEnd?: number }
const DEFAULT_ATOMIC_TAGS = ['head', 'style', 'script', 'math', 'object', 'video', 'iframe']
/**
 * Tokenizes a string of HTML.
 **/
function tokenizeHtml(text: string, atomicTags: string[] = DEFAULT_ATOMIC_TAGS) {
	const tokens: Token[] = []
	let tagRange: TagRange = {}

	// we don't actually ignore these tags but only split their
	// contents as a single token instead. This way we can be
	// performant without adding special conditions.
	let ignoring: { tag: string; content: string } | undefined = undefined

	const tokenizer = new Tokenizer(
		{ decodeEntities: false, xmlMode: false },
		{
			onclosetag(start, end) {
				pushTag({ start, end }, 'closing')
			},
			ondeclaration(start, end) {
				pushTag({ start, end }, 'declaration')
			},
			onopentagend(end) {
				tagRange.end = end
				pushTag(tagRange)
			},
			onopentagname(start, end) {
				tagRange.start = start
				tagRange.nameEnd = end
			},
			onselfclosingtag(end) {
				tagRange.end = end
				pushTag(tagRange, 'self-closing')
			},
			ontext(start, end) {
				if (ignoring) {
					ignoring.content += text.slice(start, end)
					return
				}

				const tokenized = text.slice(start, end).split(/(\s+|&.+?;|[^A-Za-z0-9#])/gm)
				tokenized.forEach((t) => {
					if (!t) return
					tokens.push({ type: 'text', value: t, length: t.length })
				})
			},

			onprocessinginstruction() {},
			onattribdata() {},
			onattribend() {},
			onattribentity() {},
			onattribname() {},
			oncdata() {},
			oncomment() {},
			onend() {},
			ontextentity() {},
		},
	)
	tokenizer.write(text)
	tokenizer.end()

	function pushTag(range: TagRange, type?: 'closing' | 'declaration' | 'self-closing') {
		if (!range.start || !range.end) {
			tagRange = {}
			return
		}

		const tagName = text.slice(range.start, range.nameEnd || range.end)
		const tag = range.nameEnd ? text.slice(range.start, range.end) : tagName
		let tagStart = type === 'declaration' ? `<!` : type === 'closing' ? '</' : '<'
		const raw = `${tagStart}${tag}>`

		if (ignoring || atomicTags.includes(tagName)) {
			ignoring = ignoring || {
				tag: tagName,
				content: '',
			}
			ignoring.content += raw

			if (type && ignoring.tag === tagName) {
				tokens.push({
					type: 'tag-full',
					name: ignoring.tag,
					raw: ignoring.content,
					length: ignoring.content.length,
				})
			}
		} else {
			tokens.push({
				raw,
				type: type === 'closing' ? 'tag-end' : 'tag-start',
				name: tagName,
				length: range.end - range.start,
			})
		}
		tagRange = {}
	}

	return tokens
}

function joinTokens(tokens: Token[], separator?: string): string {
	let str = ''
	for (let i = 0; i < tokens.length; ++i) {
		const token = tokens[i]
		str += token.type === 'text' ? token.value : token.raw
		if (separator && i < tokens.length - 1) str += separator
	}
	return str
}

export { joinTokens, tokenizeHtml, DEFAULT_ATOMIC_TAGS }
