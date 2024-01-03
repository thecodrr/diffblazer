<h1 align='center'>Diffmarker</h1>

<p align='center'>Blazing fast diff checker & marker for HTML and Plaintext</p>

This work is based on [htmldiff.net](https://github.com/Rohland/htmldiff.net). Originally, I forked [htmldiff-javascript](https://github.com/jibin2706/htmldiff-javascript) (which is a fork of [htmldiff-js](https://github.com/dfoverdx/htmldiff-js)), but now the code has almost completely deviated. A summary of the changes:

1. New faster tokenizer based on [htmlparser2](https://github.com/fb55/htmlparser2)
2. Support for "atomic" tags (i.e. tags that should be considered as 1 token) in the tokenizer
3. Support for diffing nodes based on attributes
4. No such thing as "word" anymore. Everything is a token
5. More efficient match finder (no more unnecessary stripping of attributes from tags)
6. Extensive test suite (thanks to [htmldiff.net](https://github.com/Rohland/htmldiff.net) and [htmldiff.js](https://github.com/idesis-gmbh/htmldiff.js))
7. Removed support for block expressions
8. Tags & class names are now fully configurable
9. ~100x faster (no kidding!)

## Installation

```bash
npm install diffmarker
```

## Usage

```ts
import { mark } from 'diffmarker'

const oldHtml = '<p>hello world</p>'
const newHtml = '<p>hello world!</p>'

mark(oldHtml, newHtml)

// Output: <p>hello world<ins class='diffins'>!</ins></p>
```

### Custom markers

Aside from marking differences using HTML tags, you can also specify your own markers. This can be anything:

```ts
import { mark } from 'diffmarker'

const oldText = 'hello world'
const newText = 'hello beautiful world'

mark(oldText, newText, {
	markers: {
		insert: {
			start: '**',
			end: '**',
		},
	},
})

// Output: hello **beautiful** world
```
