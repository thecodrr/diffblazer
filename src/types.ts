export type Marker = {
	start: string
	end: string
}
export type Markers = Record<'delete' | 'insert' | 'modify' | 'replaceDelete' | 'replaceInsert', Marker>

export type Options = {
	/**
	 * Defines how to compare repeating words. Valid values are from 0 to 1.
	 * This value allows to exclude some words from comparison that eventually
	 * reduces the total time of the diff algorithm.
	 *
	 * - 0 means that all words are excluded so the diff will not find any matching words at all.
	 * - 1 (default value) means that all words participate in comparison so this is the most accurate case.
	 * - 0.5 means that any word that occurs more than 50% times may be excluded from comparison. This doesn't
	 * mean that such words will definitely be excluded but only gives a permission to exclude them if necessary.
	 */
	repeatingWordsAccuracy: number
	/**
	 * This value defines balance between speed and memory utilization. The higher it is the faster it works and more memory it consumes.
	 *
	 * Note: a bigger value won't always increase speed, and most probably will
	 * negatively affect performance.
	 *
	 * @status experimental
	 * @default 4
	 */
	matchGranularity: number
	/**
	 * Turn this on to ignore any and all whitespace differences.
	 *
	 * @example "hello   world" === "hello world"
	 *
	 * @default false
	 */
	ignoreWhiteSpaceDifferences: boolean
	/**
	 * Tags to consider as a single token regardles of what's inside them.
	 * Useful when you don't want to deeply compare the contents of a tag.
	 *
	 * @default ['head', 'style', 'script', 'math', 'object', 'video', 'iframe']
	 */
	atomicTags: string[]

	/**
	 * Custom class names for
	 */
	markers: Markers

	/**
	 * If some match is too small and located far from its neighbors then it is considered as orphan
	 * and removed. For example:
	 *
	 * ```
	 * aaaaa bb ccccccccc dddddd ee
	 * 11111 bb 222222222 dddddd ee
	 * ```
	 *
	 * will find two matches `bb` and `dddddd ee` but the first will be considered
	 * as orphan and ignored. As a result it will consider texts `aaaaa bb ccccccccc` and
	 * `11111 bb 222222222` as single replacement:
	 *
	 * ```html
	 * <del>aaaaa bb ccccccccc</del><ins>11111 bb 222222222</ins> dddddd ee
	 * ```
	 *
	 * This property defines relative size of the match to be considered as orphan, from 0 to 1.
	 *
	 * - 1 means that all matches will be considered as orphans.
	 *
	 * - 0 (default) means that no match will be considered as orphan.
	 *
	 * - 0.2 means that if match length is less than 20% of distance between its neighbors it is considered as orphan.
	 * @default 0
	 */
	orphanMatchThreshold: number
}
