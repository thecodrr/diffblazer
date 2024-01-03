import { TagToken } from './tokenizer'

export type MatchOptions = {
	blockSize: number
	repeatingTokensAccuracy: number
	ignoreWhitespaceDifferences: boolean
	matchers: Record<string, (token: TagToken) => string>
}

export const MatchOptions: MatchOptions = {
	matchers: {},
	blockSize: 0,
	repeatingTokensAccuracy: 1.0,
	ignoreWhitespaceDifferences: false,
}
