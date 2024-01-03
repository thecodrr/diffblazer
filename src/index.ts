import { Action } from './action'
import { Match } from './match'
import { MatchFinder } from './match-finder'
import { Operation } from './operation'
import { MatchOptions } from './match-options'
import { Token, TagToken, DEFAULT_ATOMIC_TAGS, tokenizeHtml, joinTokens } from './tokenizer'
import { isNotTag, isTag, wrapText } from './utils'
import type { Markers, Marker, Options } from './types'

const MatchGranuarityMaximum = 4

const defaultMarkers: Markers = {
	delete: {
		start: `<del class='diffdel'>`,
		end: `</del>`,
	},
	insert: {
		start: `<ins class='diffins'>`,
		end: `</ins>`,
	},
	modify: {
		start: `<ins class='mod'>`,
		end: `</ins>`,
	},
	replaceInsert: {
		start: `<ins class='diffmod'>`,
		end: `</ins>`,
	},
	replaceDelete: {
		start: `<del class='diffmod'>`,
		end: `</del>`,
	},
}
const specialCaseTags = new Set(['strong', 'em', 'b', 'i', 'big', 'small', 'u', 'sub', 'strike', 's', 'dfn', 'span'])

const ATTRIBUTE_REGEX = (attr: string) => new RegExp(` ${attr}=(.+?['"])`)
const SRC_REGEX = ATTRIBUTE_REGEX('src')
const DATA_REGEX = ATTRIBUTE_REGEX('data')
const MATH_CONTENT_REGEX = /<math.*?>(.+)?<\/\s*math>/

function attributeMatcher(token: TagToken, attributes: Record<string, RegExp>) {
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
	img: (token: TagToken) => attributeMatcher(token, { src: SRC_REGEX }),
	object: (token: TagToken) => attributeMatcher(token, { data: DATA_REGEX }),
	math: (token: TagToken) => {
		const matches = MATH_CONTENT_REGEX.exec(token.raw)
		return matches ? matches[1] : token.name
	},
	video: (token: TagToken) => attributeMatcher(token, { src: SRC_REGEX }),
	iframe: (token: TagToken) => attributeMatcher(token, { src: SRC_REGEX }),
}

export class Diffmarker {
	private content: string[] = []

	private specialTagDiffStack: TagToken[]
	private newTokens: Token[] = []
	private oldTokens: Token[] = []
	private matchGranularity = 0
	private options: Options

	constructor(private oldText: string, private newText: string, options?: Partial<Options>) {
		this.specialTagDiffStack = []
		this.newTokens = []
		this.oldTokens = []

		this.options = {
			atomicTags: DEFAULT_ATOMIC_TAGS,
			ignoreWhiteSpaceDifferences: false,
			orphanMatchThreshold: 0.0,
			markers: {
				...options?.markers,
				...defaultMarkers,
			},
			matchGranularity: MatchGranuarityMaximum,
			repeatingWordsAccuracy: 1.0,
			...options,
		}
	}

	build() {
		if (this.oldText === this.newText) {
			return this.newText
		}

		this.tokenizeInputs()

		let operations = this.operations()
		for (let item of operations) {
			this.performOperation(item)
		}

		return this.content.join('')
	}

	tokenizeInputs() {
		this.oldTokens = tokenizeHtml(this.oldText, this.options.atomicTags)

		//free memory, allow it for GC
		this.oldText = ''

		this.newTokens = tokenizeHtml(this.newText, this.options.atomicTags)

		//free memory, allow it for GC
		this.newText = ''
	}

	performOperation(opp: Operation) {
		switch (opp.action) {
			case Action.equal:
				this.processEqualOperation(opp)
				break
			case Action.delete:
				this.processDeleteOperation(opp, this.options.markers.delete)
				break
			case Action.insert:
				this.processInsertOperation(opp, this.options.markers.insert)
				break
			case Action.replace:
				this.processReplaceOperation(opp)
				break
		}
	}

	processReplaceOperation(opp: Operation) {
		this.processDeleteOperation(opp, this.options.markers.replaceDelete)
		this.processInsertOperation(opp, this.options.markers.replaceInsert)
	}

	processInsertOperation(opp: Operation, marker: Marker) {
		let text = this.newTokens.filter((_, pos) => pos >= opp.startInNew && pos < opp.endInNew)
		this.markDifference(marker, text, Action.insert)
	}

	processDeleteOperation(opp: Operation, marker: Marker) {
		let text = this.oldTokens.filter((_, pos) => pos >= opp.startInOld && pos < opp.endInOld)
		this.markDifference(marker, text, Action.delete)
	}

	processEqualOperation(opp: Operation) {
		let result = this.newTokens.filter((_, pos) => pos >= opp.startInNew && pos < opp.endInNew)
		this.content.push(joinTokens(result))
	}

	markDifference(marker: Marker, tokens: Token[], action: Action) {
		while (tokens.length) {
			let nonTags = this.extractConsecutiveTokens(
				tokens,
				(x) => isNotTag(x) || this.options.atomicTags.includes(x.name) || x.name === 'img',
			)

			let specialCaseTagInjection = ''
			let specialCaseTagInjectionIsBefore = false

			if (nonTags.length !== 0) {
				let text = wrapText(joinTokens(nonTags), marker)
				this.content.push(text)
			} else {
				const firstToken = tokens[0]
				if (firstToken.type === 'tag-start' && specialCaseTags.has(firstToken.name)) {
					this.specialTagDiffStack.push(firstToken)
					specialCaseTagInjection = this.options.markers.modify.start

					if (action === Action.delete) {
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
						specialCaseTagInjection = this.options.markers.modify.end
						specialCaseTagInjectionIsBefore = true
					}

					if (action === Action.delete) {
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
					this.content.push(specialCaseTagInjection + joinTokens(this.extractConsecutiveTokens(tokens, isTag)))
				} else {
					this.content.push(joinTokens(this.extractConsecutiveTokens(tokens, isTag)) + specialCaseTagInjection)
				}
			}
		}
	}

	extractConsecutiveTokens(tokens: Token[], condition: (value: Token) => boolean) {
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
		this.matchGranularity = Math.min(
			this.options.matchGranularity,
			Math.min(this.oldTokens.length, this.newTokens.length),
		)

		let positionInOld = 0
		let positionInNew = 0
		let operations: Operation[] = []

		let matches = this.matchingBlocks()
		matches.push(new Match(this.oldTokens.length, this.newTokens.length, 0))

		let matchesWithoutOrphans = this.options.orphanMatchThreshold > 0 ? this.removeOrphans(matches) : matches

		for (let match of matchesWithoutOrphans) {
			if (match === null) continue
			let matchStartsAtCurrentPositionInOld = positionInOld === match.startInOld
			let matchStartsAtCurrentPositionInNew = positionInNew === match.startInNew

			let action: Action | undefined = undefined

			if (!matchStartsAtCurrentPositionInOld && !matchStartsAtCurrentPositionInNew) {
				action = Action.replace
			} else if (matchStartsAtCurrentPositionInOld && !matchStartsAtCurrentPositionInNew) {
				action = Action.insert
			} else if (!matchStartsAtCurrentPositionInOld) {
				action = Action.delete
			}

			if (action !== undefined) {
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

			let sumLength = (t: number, n: Token) => t + n.length

			let oldDistanceInChars = this.oldTokens.slice(prev?.endInOld, next.startInOld).reduce(sumLength, 0)
			let newDistanceInChars = this.newTokens.slice(prev?.endInNew, next.startInNew).reduce(sumLength, 0)
			let currMatchLengthInChars = this.newTokens.slice(curr.startInNew, curr.endInNew).reduce(sumLength, 0)
			if (
				currMatchLengthInChars >
				Math.max(oldDistanceInChars, newDistanceInChars) * this.options.orphanMatchThreshold
			) {
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
			options.ignoreWhitespaceDifferences = this.options.ignoreWhiteSpaceDifferences
			options.matchers = matchers
			options.repeatingTokensAccuracy = this.options.repeatingWordsAccuracy

			let finder = new MatchFinder(this.oldTokens, this.newTokens, startInOld, endInOld, startInNew, endInNew, options)
			let match = finder.findMatch()
			if (match !== null) {
				return match
			}
		}

		return null
	}
}

export function mark(oldHtml: string, newHtml: string, options?: Partial<Options>) {
	return new Diffmarker(oldHtml, newHtml, options).build()
}
export {
	/**
	 * Alias for `mark`
	 */
	mark as diff,
}
