type MatchOptions = {
	blockSize: number
	repeatingTokensAccuracy: number
	ignoreWhitespaceDifferences: boolean
}

const MatchOptions: MatchOptions = {
	blockSize: 0,
	repeatingTokensAccuracy: 0.0,
	ignoreWhitespaceDifferences: false,
}

export default MatchOptions
