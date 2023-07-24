# htmldiff-javascript

Diffs two HTML blocks, and returns a meshing of the two that includes `<ins>` and `<del>` elements. The classes of these elements are `ins.diffins` for new code, `del.diffdel` for removed code, and `del.diffmod` and `ins.diffmod` for sections of code that have been changed.

For "special tags" (primarily style tags such as `<em>` and `<strong>`), `ins.mod` elements are inserted with the new styles.

Typescript port of [htmldiff.net](https://github.com/Rohland/htmldiff.net).

Fork of [htmldiff-js](https://github.com/dfoverdx/htmldiff-js). With the following changes:

1. Typescript
2. Expose [options](src/lib/types.ts) from the HTMLDiff class

## Installation

```bash
npm install htmldiff-javascript
```

## Usage

```html
<html>
	<body>
		<div id="oldHtml">
			<p>Some <em>old</em> html here</p>
		</div>

		<div id="newHtml">
			<p>Some <b>new</b> html goes here</p>
		</div>

		<div id="diffHtml"></div>
	</body>
</html>
```

```javascript
import HtmlDiff from 'htmldiff-javascript'

let oldHtml = document.getElementById('oldHtml')
let newHtml = document.getElementById('newHtml')
let diffHtml = document.getElementById('diffHtml')

diffHtml.innerHTML = HtmlDiff.execute(oldHtml.innerHTML, newHtml.innerHTML)
```

## TODOs

- [x] Convert everything to typescript
- [ ] Add tests
- [ ] Setup Publishing Pipeline
