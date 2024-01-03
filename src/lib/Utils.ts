import * as WordSplitter from './Tokenizer'

const whitespaceRegex = /^(\s|&nbsp;)+$/

function isTag(token: WordSplitter.Token) {
	return token.type !== 'text'
}

function isNotTag(token: WordSplitter.Token): token is WordSplitter.TextToken {
	return !isTag(token)
}

function wrapText(text: string, tagName: string, cssClass: string) {
	return ['<', tagName, " class='", cssClass, "'>", text, '</', tagName, '>'].join('')
}

function isWhiteSpace(character: string) {
	return whitespaceRegex.test(character)
}

export { isNotTag, isTag, wrapText, isWhiteSpace }
