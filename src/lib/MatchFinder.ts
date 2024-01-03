import Match from './Match'
import MatchOptions from './MatchOptions'
import * as Utils from './Utils'
import * as Tokenizer from './Tokenizer'

function putNewToken(block: string[], token: string, blockSize: number) {
	block.push(token)

	if (block.length > blockSize) {
		block.shift()
	}

	if (block.length !== blockSize) {
		return null
	}

	return block.join('')
}

// Finds the longest match in given texts. It uses indexing with fixed granularity that is used to compare blocks of text.
export default class MatchFinder {
	private oldTokens: Tokenizer.Token[]
	private newTokens: Tokenizer.Token[]
	private startInOld: number
	private endInOld: number
	private startInNew: number
	private endInNew: number
	private options: MatchOptions
	private tokenIndices: Map<string, number[]>

	constructor(
		oldTokens: Tokenizer.Token[],
		newTokens: Tokenizer.Token[],
		startInOld: number,
		endInOld: number,
		startInNew: number,
		endInNew: number,
		options: MatchOptions,
	) {
		this.oldTokens = oldTokens
		this.newTokens = newTokens
		this.startInOld = startInOld
		this.endInOld = endInOld
		this.startInNew = startInNew
		this.endInNew = endInNew
		this.options = options
		this.tokenIndices = new Map()
	}

	indexNewTokens() {
		this.tokenIndices = new Map()
		let block: string[] = [''].slice(1)
		let threshold = this.newTokens.length + this.options.repeatingTokensAccuracy
		let blacklist = new Set<string>()

		for (let i = this.startInNew; i < this.endInNew; i++) {
			let token = this.normalizeForIndex(this.newTokens[i])
			let key = putNewToken(block, token, this.options.blockSize)

			if (key === null || blacklist.has(key)) {
				continue
			}

			const index = this.tokenIndices.get(key)
			if (index) {
				// This removes & blacklists tokens that occur too many times.
				// This way it reduces total count of comparison operations
				// and as result the diff algorithm takes less time. But the
				// side effect is that it may detect false differences of
				// the repeating tokens.
				if (index.length >= threshold) {
					blacklist.add(key)
					this.tokenIndices.delete(key)
					continue
				}

				index.push(i)
			} else {
				this.tokenIndices.set(key, [i])
			}
		}
	}

	// Converts the token to index-friendly value so it can be compared with other similar tokens
	normalizeForIndex(token: Tokenizer.Token) {
		if (this.options.ignoreWhitespaceDifferences && token.type === 'text' && Utils.isWhiteSpace(token.value)) {
			return ' '
		}

		return token.type === 'text'
			? token.value
			: this.options.matchers[token.name]
			? this.options.matchers[token.name](token)
			: token.name
	}

	findMatch() {
		this.indexNewTokens()

		if (this.tokenIndices.size === 0) {
			return null
		}

		let bestMatchInOld = this.startInOld
		let bestMatchInNew = this.startInNew
		let bestMatchSize = 0

		let matchLengthAt = new Map()
		const blockSize = this.options.blockSize
		let block: string[] = [''].slice(1)

		for (let indexInOld = this.startInOld; indexInOld < this.endInOld; indexInOld++) {
			let token = this.normalizeForIndex(this.oldTokens[indexInOld])
			let index = putNewToken(block, token, blockSize)

			if (index === null) {
				continue
			}

			let newMatchLengthAt = new Map()

			const tokenIndices = this.tokenIndices.get(index)
			if (!tokenIndices) {
				matchLengthAt = newMatchLengthAt
				continue
			}

			for (let indexInNew of tokenIndices) {
				let newMatchLength = (matchLengthAt.get(indexInNew - 1) || 0) + 1
				newMatchLengthAt.set(indexInNew, newMatchLength)

				if (newMatchLength > bestMatchSize) {
					bestMatchInOld = indexInOld - newMatchLength - blockSize + 2
					bestMatchInNew = indexInNew - newMatchLength - blockSize + 2
					bestMatchSize = newMatchLength
				}
			}

			matchLengthAt = newMatchLengthAt
		}

		return bestMatchSize !== 0 ? new Match(bestMatchInOld, bestMatchInNew, bestMatchSize + blockSize - 1) : null
	}
}
