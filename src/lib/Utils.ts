import * as WordSplitter from './Tokenizer'

const whitespaceRegex = /^(\s|&nbsp;)+$/
const specialCaseWordTags = ['img']

function isTag(token: WordSplitter.Token) {
	return token.type !== 'text' && !specialCaseWordTags.includes(token.name)
}

function isNotTag(token: WordSplitter.Token) {
	return !isTag(token)
}

function wrapText(text: string, tagName: string, cssClass: string) {
	return ['<', tagName, " class='", cssClass, "'>", text, '</', tagName, '>'].join('')
}

function isWhiteSpace(character: string) {
	return whitespaceRegex.test(character)
}

export { isNotTag, isTag, wrapText, isWhiteSpace }
