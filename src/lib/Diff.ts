import Action from './Action'
import Match from './Match'
import MatchFinder from './MatchFinder'
import Operation from './Operation'
import MatchOptions from './MatchOptions'
import * as Tokenizer from './Tokenizer'
import * as Utils from './Utils'
import type { DiffClassNames, DiffTags, HTMLDiffOptions } from './types'

const MatchGranuarityMaximum = 4

const specialCaseTags = new Set(['strong', 'em', 'b', 'i', 'big', 'small', 'u', 'sub', 'strike', 's', 'dfn', 'span'])

const ATTRIBUTE_REGEX = (attr: string) => new RegExp(` ${attr}=(.+?['"])`)
const SRC_REGEX = ATTRIBUTE_REGEX('src')
const DATA_REGEX = ATTRIBUTE_REGEX('data')
const MATH_CONTENT_REGEX = /<math.+?>(.+)?<\/math>/

function attributeMatcher(token: Tokenizer.TagToken, attributes: Record<string, RegExp>) {
	let text = token.name
	for (const attr in attributes) {
		if (token.raw.includes(` ${attr}=`)) {
			const regex = attributes[attr]
			const matches = regex.exec(token.raw)
			if (!matches) continue
			text += matches[1]
		}
	}
	return text
}

const matchers = {
	img: (token: Tokenizer.TagToken) => attributeMatcher(token, { src: SRC_REGEX }),
	object: (token: Tokenizer.TagToken) => attributeMatcher(token, { data: DATA_REGEX }),
	math: (token: Tokenizer.TagToken) => {
		const matches = MATH_CONTENT_REGEX.exec(token.raw)
		return matches ? matches[1] : token.name
	},
	video: (token: Tokenizer.TagToken) => attributeMatcher(token, { src: SRC_REGEX }),
	iframe: (token: Tokenizer.TagToken) => attributeMatcher(token, { src: SRC_REGEX }),
}

class HtmlDiff {
	private content: string[]
	private newText: string
	private oldText: string

	private specialTagDiffStack: Tokenizer.TagToken[]
	private newTokens: Tokenizer.Token[]
	private oldTokens: Tokenizer.Token[]
	private matchGranularity: number

	private repeatingTokensAccuracy: number
	private ignoreWhiteSpaceDifferences: boolean
	private orphanMatchThreshold: number
	private atomicTags: string[]
	private classNames: DiffClassNames
	private tags: DiffTags

	constructor(oldText: string, newText: string, options?: Partial<HTMLDiffOptions>) {
		this.content = []
		this.newText = newText
		this.oldText = oldText

		this.specialTagDiffStack = []
		this.newTokens = []
		this.oldTokens = []
		this.matchGranularity = options?.matchGranularity ?? MatchGranuarityMaximum

		this.repeatingTokensAccuracy = options?.repeatingTokensAccuracy ?? 1.0
		this.ignoreWhiteSpaceDifferences = options?.ignoreWhiteSpaceDifferences ?? false
		this.orphanMatchThreshold = options?.orphanMatchThreshold ?? 0.0
		this.atomicTags = options?.atomicTags ?? Tokenizer.DEFAULT_ATOMIC_TAGS
		this.classNames = options?.classNames ?? {
			del: 'diffdel',
			ins: 'diffins',
			replace: 'diffmod',
			mod: 'mod',
		}
		this.tags = options?.tags ?? {
			del: 'del',
			ins: 'ins',
		}
	}

	static execute(oldText: string, newText: string, options?: Partial<HTMLDiffOptions>) {
		return new HtmlDiff(oldText, newText, options).build()
	}

	build() {
		if (this.oldText === this.newText) {
			return this.newText
		}

		this.tokenizeInputs()

		this.matchGranularity = Math.min(this.matchGranularity, this.oldTokens.length, this.newTokens.length)
		let operations = this.operations()
		for (let item of operations) {
			this.performOperation(item)
		}

		return this.content.join('')
	}

	tokenizeInputs() {
		this.oldTokens = Tokenizer.tokenizeHtml(this.oldText, this.atomicTags)

		//free memory, allow it for GC
		this.oldText = ''

		this.newTokens = Tokenizer.tokenizeHtml(this.newText, this.atomicTags)

		//free memory, allow it for GC
		this.newText = ''
	}

	performOperation(opp: Operation) {
		switch (opp.action) {
			case Action.equal:
				this.processEqualOperation(opp)
				break
			case Action.delete:
				this.processDeleteOperation(opp, this.classNames.del)
				break
			case Action.insert:
				this.processInsertOperation(opp, this.classNames.ins)
				break
			case Action.none:
				break
			case Action.replace:
				this.processReplaceOperation(opp)
				break
		}
	}

	processReplaceOperation(opp: Operation) {
		this.processDeleteOperation(opp, this.classNames.replace)
		this.processInsertOperation(opp, this.classNames.replace)
	}

	processInsertOperation(opp: Operation, cssClass: string) {
		let text = this.newTokens.filter((_, pos) => pos >= opp.startInNew && pos < opp.endInNew)
		this.insertTag(this.tags.ins, cssClass, text)
	}

	processDeleteOperation(opp: Operation, cssClass: string) {
		let text = this.oldTokens.filter((_, pos) => pos >= opp.startInOld && pos < opp.endInOld)
		this.insertTag(this.tags.del, cssClass, text)
	}

	processEqualOperation(opp: Operation) {
		let result = this.newTokens.filter((_, pos) => pos >= opp.startInNew && pos < opp.endInNew)
		this.content.push(Tokenizer.joinTokens(result))
	}

	insertTag(tag: string, cssClass: string, tokens: Tokenizer.Token[]) {
		while (tokens.length) {
			let nonTags = this.extractConsecutiveTokens(
				tokens,
				(x) => Utils.isNotTag(x) || this.atomicTags.includes(x.name) || x.name === 'img',
			)

			let specialCaseTagInjection = ''
			let specialCaseTagInjectionIsBefore = false

			if (nonTags.length !== 0) {
				let text = Utils.wrapText(Tokenizer.joinTokens(nonTags), tag, cssClass)
				this.content.push(text)
			} else {
				const firstToken = tokens[0]
				if (firstToken.type === 'tag-start' && specialCaseTags.has(firstToken.name)) {
					this.specialTagDiffStack.push(firstToken)
					specialCaseTagInjection = `<${this.tags.ins} class='${this.classNames.mod}'>`

					if (tag === this.tags.del) {
						tokens.shift()
						while (tokens.length > 0 && tokens[0].type === 'tag-start' && specialCaseTags.has(tokens[0].name)) {
							tokens.shift()
						}
					}
				} else if (firstToken.type === 'tag-end' && specialCaseTags.has(firstToken.name)) {
					let openingTag = this.specialTagDiffStack.length === 0 ? null : this.specialTagDiffStack.pop()

					const lastToken = tokens.at(-1)
					const openingAndClosingTagsMatch =
						openingTag && lastToken?.type === 'tag-end' && openingTag.name === lastToken.name

					if (openingAndClosingTagsMatch) {
						specialCaseTagInjection = `</${this.tags.ins}>`
						specialCaseTagInjectionIsBefore = true
					}

					if (tag === this.tags.del) {
						tokens.shift()
						while (tokens.length > 0 && tokens[0].type === 'tag-end' && specialCaseTags.has(tokens[0].name)) {
							tokens.shift()
						}
					}
				}

				if (tokens.length === 0 && specialCaseTagInjection.length === 0) {
					break
				}

				if (specialCaseTagInjectionIsBefore) {
					this.content.push(
						specialCaseTagInjection + Tokenizer.joinTokens(this.extractConsecutiveTokens(tokens, Utils.isTag)),
					)
				} else {
					this.content.push(
						Tokenizer.joinTokens(this.extractConsecutiveTokens(tokens, Utils.isTag)) + specialCaseTagInjection,
					)
				}
			}
		}
	}

	extractConsecutiveTokens(tokens: Tokenizer.Token[], condition: (value: Tokenizer.Token) => boolean) {
		let indexOfFirstTag: number | null = null

		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i]

			if (i === 0 && token.type === 'text' && token.value === ' ') {
				token.value = '&nbsp;'
			}

			if (!condition(token)) {
				indexOfFirstTag = i
				break
			}
		}

		if (indexOfFirstTag !== null) {
			let items = tokens.filter((_, pos) => pos >= 0 && pos < indexOfFirstTag!)
			if (indexOfFirstTag > 0) {
				tokens.splice(0, indexOfFirstTag)
			}

			return items
		} else {
			let items = tokens.filter((_, pos) => pos >= 0 && pos < tokens.length)
			tokens.splice(0, tokens.length)
			return items
		}
	}

	operations() {
		let positionInOld = 0
		let positionInNew = 0
		let operations: Operation[] = []

		let matches = this.matchingBlocks()
		matches.push(new Match(this.oldTokens.length, this.newTokens.length, 0))

		let matchesWithoutOrphans = this.removeOrphans(matches)

		for (let match of matchesWithoutOrphans) {
			if (match === null) continue
			let matchStartsAtCurrentPositionInOld = positionInOld === match.startInOld
			let matchStartsAtCurrentPositionInNew = positionInNew === match.startInNew

			let action

			if (!matchStartsAtCurrentPositionInOld && !matchStartsAtCurrentPositionInNew) {
				action = Action.replace
			} else if (matchStartsAtCurrentPositionInOld && !matchStartsAtCurrentPositionInNew) {
				action = Action.insert
			} else if (!matchStartsAtCurrentPositionInOld) {
				action = Action.delete
			} else {
				action = Action.none
			}

			if (action !== Action.none) {
				const op = new Operation(action, positionInOld, match.startInOld, positionInNew, match.startInNew)
				operations.push(op)
			}

			if (match.size !== 0) {
				operations.push(new Operation(Action.equal, match.startInOld, match.endInOld, match.startInNew, match.endInNew))
			}

			positionInOld = match.endInOld
			positionInNew = match.endInNew
		}

		return operations
	}

	*removeOrphans(matches: Match[]) {
		let prev = null
		let curr = null

		for (let next of matches) {
			if (curr === null) {
				prev = new Match(0, 0, 0)
				curr = next
				continue
			}

			if (
				(prev?.endInOld === curr.startInOld && prev?.endInNew === curr.startInNew) ||
				(curr.endInOld === next.startInOld && curr.endInNew === next.startInNew)
			) {
				yield curr
				curr = next
				continue
			}

			let sumLength = (t: number, n: Tokenizer.Token) => t + n.length

			let oldDistanceInChars = this.oldTokens.slice(prev?.endInOld, next.startInOld).reduce(sumLength, 0)
			let newDistanceInChars = this.newTokens.slice(prev?.endInNew, next.startInNew).reduce(sumLength, 0)
			let currMatchLengthInChars = this.newTokens.slice(curr.startInNew, curr.endInNew).reduce(sumLength, 0)
			if (currMatchLengthInChars > Math.max(oldDistanceInChars, newDistanceInChars) * this.orphanMatchThreshold) {
				yield curr
			}

			prev = curr
			curr = next
		}

		yield curr
	}

	matchingBlocks() {
		let matchingBlocks: Match[] = []
		this.findMatchingBlocks(0, this.oldTokens.length, 0, this.newTokens.length, matchingBlocks)
		return matchingBlocks
	}

	findMatchingBlocks(
		startInOld: number,
		endInOld: number,
		startInNew: number,
		endInNew: number,
		matchingBlocks: Match[],
	) {
		let match = this.findMatch(startInOld, endInOld, startInNew, endInNew)

		if (match !== null) {
			if (startInOld < match.startInOld && startInNew < match.startInNew) {
				this.findMatchingBlocks(startInOld, match.startInOld, startInNew, match.startInNew, matchingBlocks)
			}

			matchingBlocks.push(match)

			if (match.endInOld < endInOld && match.endInNew < endInNew) {
				this.findMatchingBlocks(match.endInOld, endInOld, match.endInNew, endInNew, matchingBlocks)
			}
		}
	}

	findMatch(startInOld: number, endInOld: number, startInNew: number, endInNew: number) {
		for (let i = this.matchGranularity; i > 0; i--) {
			let options = MatchOptions
			options.blockSize = i
			options.repeatingTokensAccuracy = this.repeatingTokensAccuracy
			options.ignoreWhitespaceDifferences = this.ignoreWhiteSpaceDifferences
			options.matchers = matchers

			let finder = new MatchFinder(this.oldTokens, this.newTokens, startInOld, endInOld, startInNew, endInNew, options)
			let match = finder.findMatch()
			if (match !== null) {
				return match
			}
		}

		return null
	}

	// private expandToWrapTag(tokens: Tokenizer.Token[], start: number, end: number) {
	// 	let newEnd = end
	// 	for (let i = start; i < end; ++i) {
	// 		const token = tokens[i]
	// 		if (token.type === 'tag-start' && !token.selfClosing) {
	// 			let endToken = tokens.findIndex((t, index) => index > i && t.type === 'tag-end' && t.name === token.name)
	// 			if (endToken === -1) continue
	// 			endToken++
	// 			if (endToken <= newEnd) continue
	// 			newEnd = endToken
	// 		}
	// 	}
	// 	return newEnd
	// }
}

export default HtmlDiff
