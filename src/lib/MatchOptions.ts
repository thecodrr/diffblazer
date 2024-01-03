import { TagToken } from './Tokenizer'

type MatchOptions = {
	blockSize: number
	ignoreWhitespaceDifferences: boolean
	matchers: Record<string, (token: TagToken) => string>
}

const MatchOptions: MatchOptions = {
	matchers: {},
	blockSize: 0,
	ignoreWhitespaceDifferences: false,
}

export default MatchOptions
