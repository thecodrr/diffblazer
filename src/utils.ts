import { TextToken, Token } from './tokenizer'
import { Marker } from './types'

const whitespaceRegex = /^(\s|&nbsp;)+$/

function isTag(token: Token) {
	return token.type !== 'text'
}

function isNotTag(token: Token): token is TextToken {
	return !isTag(token)
}

function wrapText(text: string, marker: Marker) {
	return [marker.start, text, marker.end].join('')
}

function isWhiteSpace(character: string) {
	return whitespaceRegex.test(character)
}

export { isNotTag, isTag, wrapText, isWhiteSpace }
