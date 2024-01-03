export type DiffClassNames = {
	del: string
	ins: string
	replace: string
	mod: string
}

export type DiffTags = {
	del: string
	ins: string
}

export type HTMLDiffOptions = {
	/**
	 * This value defines balance between speed and memory utilization. The higher it is the faster it works and more memory it consumes.
	 *
	 * A bigger value won't always increase speed, and most probably will
	 * negatively affect performance.
	 *
	 * @status experimental
	 * @default 4
	 */
	matchGranularity: number
	repeatingTokensAccuracy: number
	ignoreWhiteSpaceDifferences: boolean
	orphanMatchThreshold: number
	atomicTags: string[]
	classNames: DiffClassNames
	tags: DiffTags
}
