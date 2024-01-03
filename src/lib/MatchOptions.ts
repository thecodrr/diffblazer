import { TagToken } from './Tokenizer'

type MatchOptions = {
	blockSize: number
	repeatingTokensAccuracy: number
	ignoreWhitespaceDifferences: boolean
	matchers: Record<string, (token: TagToken) => string>
}

const MatchOptions: MatchOptions = {
	matchers: {},
	blockSize: 0,
	repeatingTokensAccuracy: 0.0,
	ignoreWhitespaceDifferences: false,
}

export default MatchOptions
