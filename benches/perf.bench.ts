import { bench, describe } from 'vitest'
import HtmlDiff from '../src/lib/Diff'
import diff from 'node-htmldiff'

describe('benchmark', () => {
	const oldText = `<!DOCTYPE html>
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
        <meta
          name="description"
          content="Migrate database to sqlite"
        />
        <title>v3 roadmap - Notesnook</title>
        <meta name="created-at" content="29-11-2023 10:06 AM" />
        <meta name="updated-at" content="01-01-2024 01:14 PM" />
        
        
        
        
        <link rel="stylesheet" href="https://app.notesnook.com/assets/editor-styles.css?d=1703229144711">
    
        <style>
        img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 5px;
        }
        
        body {
          background-color: transparent !important;
          color: #202124;
          font-family: "Open Sans", "Noto Sans", Frutiger, Calibri, Myriad, Arial, Ubuntu, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif;
        }
    
        .math-block {
          padding-top: 20px;
          padding-bottom: 20px;
        }
        
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          color: #212121;
        }
    
        p {
          margin-bottom: 0px;
        }
        
        p[data-spacing="double"] {
          margin-top: 1em;
        }
        
        p[data-spacing="single"] {
          margin-top: 0px;
        }
    
        p[data-spacing="single"]:empty {
          margin-top: 1em;
        }
        
        pre.codeblock {
          overflow-x: auto;
        }
        
        iframe {
          max-width: 100% !important;
          background-color: transparent !important;
        }
        
        li > p {
          margin-top: 0px;
          margin-bottom: 10px;
        }
        
        .checklist > li {
          list-style: none;
          margin: 0.25em 0;
        }
        
        .checklist > li::before {
          content: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cg%20id%3D%22checklist-unchecked%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Crect%20id%3D%22Rectangle%22%20width%3D%2215%22%20height%3D%2215%22%20x%3D%22.5%22%20y%3D%22.5%22%20fill-rule%3D%22nonzero%22%20stroke%3D%22%234C4C4C%22%20rx%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E%0A");
          cursor: pointer;
          height: 1.1em;
          margin-left: -2.5em;
          margin-top: 0em;
          position: absolute;
          width: 1.5em;
          padding-left: 1em;
        }
        
        .checklist li.checked::before {
          content: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cg%20id%3D%22checklist-checked%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Crect%20id%3D%22Rectangle%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%23008837%22%20fill-rule%3D%22nonzero%22%20rx%3D%222%22%2F%3E%3Cpath%20id%3D%22Path%22%20fill%3D%22%23FFF%22%20fill-rule%3D%22nonzero%22%20d%3D%22M11.5703186%2C3.14417309%20C11.8516238%2C2.73724603%2012.4164781%2C2.62829933%2012.83558%2C2.89774797%20C13.260121%2C3.17069355%2013.3759736%2C3.72932262%2013.0909105%2C4.14168582%20L7.7580587%2C11.8560195%20C7.43776896%2C12.3193404%206.76483983%2C12.3852142%206.35607322%2C11.9948725%20L3.02491697%2C8.8138662%20C2.66090143%2C8.46625845%202.65798871%2C7.89594698%203.01850234%2C7.54483354%20C3.373942%2C7.19866177%203.94940006%2C7.19592841%204.30829608%2C7.5386474%20L6.85276923%2C9.9684299%20L11.5703186%2C3.14417309%20Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E%0A");
        }
        
        .checklist li.checked {
          color: #505050;
        }
        
        [dir="rtl"] .checklist > li::before {
          margin-left: 0;
          margin-right: -1.5em;
        }
        
        blockquote {
          border-left: 5px solid #e5e5e5;
          padding-left: 10px;
          margin-top: 0px;
        }
        
        code:not(pre code) {
          background-color: #f7f7f7;
          border: 1px solid #e5e5e5;
          border-radius: 5px;
          padding: 3px 5px 0px 5px;
          font-family: Hack, Consolas, "Andale Mono", "Lucida Console", "Liberation Mono", "Courier New", Courier, monospace !important;
          font-size: 10pt !important;
        }
        
        .ProseMirror code > span {
          font-family: Hack, Consolas, "Andale Mono", "Lucida Console", "Liberation Mono", "Courier New", Courier, monospace !important;
        }
        
        pre {
          padding: 10px;
          background-color: #e5e5e5;
          border-radius: 5px;
          font-family: Hack, Consolas, "Andale Mono", "Lucida Console", "Liberation Mono", "Courier New", Courier, monospace !important;
            margin-bottom: 16px !important;
        }
        
        table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
        }
        
        table td,
        table th {
          border: 1px solid #e5e5e5;
          box-sizing: border-box;
          min-width: 1em;
          padding: 3px 5px;
          position: relative;
          vertical-align: top;
        }
        
        table td > *,
        table th > * {
          margin-bottom: 0;
        }
        
        table th {
          background-color: #f7f7f7;
          font-weight: bold;
          text-align: left;
        }
        table p {
          margin: 0;
        }
        </style>
        <style>
          code[class*=language-],pre[class*=language-]{color:#f8f8f2;background:0 0;text-shadow:0 1px rgba(0,0,0,.3);font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto;border-radius:.3em}:not(pre)>code[class*=language-],pre[class*=language-]{background:#282a36}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#6272a4}.token.punctuation{color:#f8f8f2}.namespace{opacity:.7}.token.constant,.token.deleted,.token.property,.token.symbol,.token.tag{color:#ff79c6}.token.boolean,.token.number{color:#bd93f9}.token.attr-name,.token.builtin,.token.char,.token.inserted,.token.selector,.token.string{color:#50fa7b}.language-css .token.string,.style .token.string,.token.entity,.token.operator,.token.url,.token.variable{color:#f8f8f2}.token.atrule,.token.attr-value,.token.class-name,.token.function{color:#f1fa8c}.token.keyword{color:#8be9fd}.token.important,.token.regex{color:#ffb86c}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}
        </style>
      </head>
      <body>
        <h1>v3 roadmap</h1>
        <ul data-title="First Beta (Internal)" class="checklist"><li class="checked checklist--item"><p data-spacing="double">Migrate database to sqlite</p></li><li class="checked checklist--item"><p data-spacing="double">Migrate mobile app to new core</p></li><li class="checked checklist--item"><p data-spacing="double">Migrate web app to new core</p></li><li class="checked checklist--item"><p data-spacing="double">Migrate mobile widget to new core</p></li><li class="checked checklist--item"><p data-spacing="double">Test sync</p></li><li class="checked checklist--item"><p data-spacing="double">Test migration from old version to new version</p></li><li class="checked checklist--item"><p data-spacing="double">Test sync migration</p></li><li class="checked checklist--item"><p data-spacing="double">Test conflicts</p></li><li class="checked checklist--item"><p data-spacing="double">Test search</p></li><li class="checked checklist--item"><p data-spacing="double">Test backup restore</p></li><li class="checked checklist--item"><p data-spacing="double">Load test mobile &amp; web app</p></li><li class="checked checklist--item"><p data-spacing="double">New sync</p></li><li class="checked checklist--item"><p data-spacing="double">Background sync</p></li><li class="checked checklist--item"><p data-spacing="double">Test nested notebooks</p></li><li class="checked checklist--item"><p data-spacing="double">Migrate everything to React 18</p></li></ul><p data-spacing="double"><br></p><ul data-title="Second Beta (Public)" class="checklist"><li class="checked checklist--item"><p data-spacing="double">Nested notebooks</p></li><li class="checked checklist--item"><p data-spacing="double">Sortable side bar</p></li><li class="checklist--item"><p data-spacing="double">Note linking</p><ul class="checklist"><li class="checklist--item"><p data-spacing="double">Add new dialog &amp; sheet for linking notes (web/mobile)</p></li><li class="checklist--item"><p data-spacing="double">Note heading &amp; node search (core)</p></li><li class="checklist--item"><p data-spacing="double">Shortcuts</p></li><li class="checklist--item"><p data-spacing="double">Button in toolbar</p></li><li class="checklist--item"><p data-spacing="double">Copy note link in note menu/properties</p></li><li class="checklist--item"><p data-spacing="double">From/to link list in note</p></li></ul></li><li class="checklist--item"><p data-spacing="double">Tabs</p><ul class="checklist"><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checked checklist--item"><p data-spacing="double">Custom colors</p><ul class="checklist"><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checked checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checklist--item"><p data-spacing="double">At rest encryption (desktop &amp; mobile)</p><ul class="checklist"><li class="checklist--item"><p data-spacing="double">Web (if possible)</p></li><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Desktop</p></li></ul></li><li class="checklist--item"><p data-spacing="double">Refine UI</p></li><li class="checked checklist--item"><p data-spacing="double">Yearly reminders</p><ul class="checklist"><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checked checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checklist--item"><p data-spacing="double">Profile (username, name, picture etc.)</p><ul class="checklist"><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checklist--item"><p data-spacing="double">Image compression &amp; multi select</p><ul class="checklist"><li class="checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checked checklist--item"><p data-spacing="double">Callout component</p></li><li class="checked checklist--item"><p data-spacing="double">Simple checklists</p></li><li class="checklist--item"><p data-spacing="double">Table of contents</p><ul class="checklist"><li class="checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Web</p></li></ul></li></ul>
      </body>
    </html>
    `
	const newText = `<!DOCTYPE html>
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
        <meta
          name="description"
          content="Migrate database to sqlite"
        />
        <title>v3 roadmap - Notesnook</title>
        <meta name="created-at" content="29-11-2023 10:06 AM" />
        <meta name="updated-at" content="01-01-2024 01:14 PM" />
        
        
        
        
        <link rel="stylesheet" href="https://app.notesnook.com/assets/editor-styles.css?d=1703229144711">
    
        <style>
        img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 5px;
        }
        
        body {
          background-color: transparent !important;
          color: #202124;
          font-family: "Open Sans", "Noto Sans", Frutiger, Calibri, Myriad, Arial, Ubuntu, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif;
        }
    
        .math-block {
          padding-top: 20px;
          padding-bottom: 20px;
        }
        
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          color: #212121;
        }
    
        p {
          margin-bottom: 0px;
        }
        
        p[data-spacing="double"] {
          margin-top: 1em;
        }
        
        p[data-spacing="single"] {
          margin-top: 0px;
        }
    
        p[data-spacing="single"]:empty {
          margin-top: 1em;
        }
        
        pre.codeblock {
          overflow-x: auto;
        }
        
        iframe {
          max-width: 100% !important;
          background-color: transparent !important;
        }
        
        li > p {
          margin-top: 0px;
          margin-bottom: 10px;
        }
        
        .checklist > li {
          list-style: none;
          margin: 0.25em 0;
        }
        
        .checklist > li::before {
          content: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cg%20id%3D%22checklist-unchecked%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Crect%20id%3D%22Rectangle%22%20width%3D%2215%22%20height%3D%2215%22%20x%3D%22.5%22%20y%3D%22.5%22%20fill-rule%3D%22nonzero%22%20stroke%3D%22%234C4C4C%22%20rx%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E%0A");
          cursor: pointer;
          height: 1.1em;
          margin-left: -2.5em;
          margin-top: 0em;
          position: absolute;
          width: 1.5em;
          padding-left: 1em;
        }
        
        .checklist li.checked::before {
          content: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cg%20id%3D%22checklist-checked%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Crect%20id%3D%22Rectangle%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%23008837%22%20fill-rule%3D%22nonzero%22%20rx%3D%222%22%2F%3E%3Cpath%20id%3D%22Path%22%20fill%3D%22%23FFF%22%20fill-rule%3D%22nonzero%22%20d%3D%22M11.5703186%2C3.14417309%20C11.8516238%2C2.73724603%2012.4164781%2C2.62829933%2012.83558%2C2.89774797%20C13.260121%2C3.17069355%2013.3759736%2C3.72932262%2013.0909105%2C4.14168582%20L7.7580587%2C11.8560195%20C7.43776896%2C12.3193404%206.76483983%2C12.3852142%206.35607322%2C11.9948725%20L3.02491697%2C8.8138662%20C2.66090143%2C8.46625845%202.65798871%2C7.89594698%203.01850234%2C7.54483354%20C3.373942%2C7.19866177%203.94940006%2C7.19592841%204.30829608%2C7.5386474%20L6.85276923%2C9.9684299%20L11.5703186%2C3.14417309%20Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E%0A");
        }
        
        .checklist li.checked {
          color: #505050;
        }
        
        [dir="rtl"] .checklist > li::before {
          margin-left: 0;
          margin-right: -1.5em;
        }
        
        blockquote {
          border-left: 5px solid #e5e5e5;
          padding-left: 10px;
          margin-top: 0px;
        }
        
        code:not(pre code) {
          background-color: #f7f7f7;
          border: 1px solid #e5e5e5;
          border-radius: 5px;
          padding: 3px 5px 0px 5px;
          font-family: Hack, Consolas, "Andale Mono", "Lucida Console", "Liberation Mono", "Courier New", Courier, monospace !important;
          font-size: 10pt !important;
        }
        
        .ProseMirror code > span {
          font-family: Hack, Consolas, "Andale Mono", "Lucida Console", "Liberation Mono", "Courier New", Courier, monospace !important;
        }
        
        pre {
          padding: 10px;
          background-color: #e5e5e5;
          border-radius: 5px;
          font-family: Hack, Consolas, "Andale Mono", "Lucida Console", "Liberation Mono", "Courier New", Courier, monospace !important;
            margin-bottom: 16px !important;
        }
        
        table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
        }
        
        table td,
        table th {
          border: 1px solid #e5e5e5;
          box-sizing: border-box;
          min-width: 1em;
          padding: 3px 5px;
          position: relative;
          vertical-align: top;
        }
        
        table td > *,
        table th > * {
          margin-bottom: 0;
        }
        
        table th {
          background-color: #f7f7f7;
          font-weight: bold;
          text-align: left;
        }
        table p {
          margin: 0;
        }
        </style>
        <style>
          code[class*=language-],pre[class*=language-]{color:#f8f8f2;background:0 0;text-shadow:0 1px rgba(0,0,0,.3);font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto;border-radius:.3em}:not(pre)>code[class*=language-],pre[class*=language-]{background:#282a36}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#6272a4}.token.punctuation{color:#f8f8f2}.namespace{opacity:.7}.token.constant,.token.deleted,.token.property,.token.symbol,.token.tag{color:#ff79c6}.token.boolean,.token.number{color:#bd93f9}.token.attr-name,.token.builtin,.token.char,.token.inserted,.token.selector,.token.string{color:#50fa7b}.language-css .token.string,.style .token.string,.token.entity,.token.operator,.token.url,.token.variable{color:#f8f8f2}.token.atrule,.token.attr-value,.token.class-name,.token.function{color:#f1fa8c}.token.keyword{color:#8be9fd}.token.important,.token.regex{color:#ffb86c}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}
        </style>
      </head>
      <body>
        <h1>v3 roadmap</h1>
        <ul data-title="First Beta (Internal)" class="checklist"><li class="checked checklist--item"><p data-spacing="double">Migrate database to sqlite</p></li><li class="checked checklist--item"><p data-spacing="double">Migrate mobile app to new core (done)</p></li><li class="checked checklist--item"><p data-spacing="double">Migrate web app to new core</p></li><li class="checked checklist--item"><p data-spacing="double">Migrate mobile widget to new core (done)</p></li><li class="checked checklist--item"><p data-spacing="double">Test sync</p></li><li class="checked checklist--item"><p data-spacing="double">Test migration from old version to new version</p></li><li class="checked checklist--item"><p data-spacing="double">Test sync migration</p></li><li class="checked checklist--item"><p data-spacing="double">Test conflicts</p></li><li class="checked checklist--item"><p data-spacing="double">Test search</p></li><li class="checked checklist--item"><p data-spacing="double">Test backup restore</p></li><li class="checked checklist--item"><p data-spacing="double">Load test mobile &amp; web app</p></li><li class="checked checklist--item"><p data-spacing="double">New sync</p></li><li class="checked checklist--item"><p data-spacing="double">Background sync</p></li><li class="checked checklist--item"><p data-spacing="double">Test nested notebooks</p></li><li class="checked checklist--item"><p data-spacing="double">Migrate everything to React 18</p></li></ul><p data-spacing="double"><br></p><ul data-title="Second Beta (Public)" class="checklist"><li class="checked checklist--item"><p data-spacing="double">Nested notebooks</p></li><li class="checked checklist--item"><p data-spacing="double">Sortable side bar</p></li><li class="checklist--item"><p data-spacing="double">Note linking</p><ul class="checklist"><li class="checklist--item"><p data-spacing="double">Add new dialog &amp; sheet for linking notes (web/mobile)</p></li><li class="checklist--item"><p data-spacing="double">Note heading &amp; node search (core)</p></li><li class="checklist--item"><p data-spacing="double">Shortcuts</p></li><li class="checklist--item"><p data-spacing="double">Button in toolbar</p></li><li class="checklist--item"><p data-spacing="double">Copy note link in note menu/properties</p></li><li class="checklist--item"><p data-spacing="double">From/to link list in note</p></li></ul></li><li class="checklist--item"><p data-spacing="double">Tabs</p><ul class="checklist"><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checked checklist--item"><p data-spacing="double">Custom colors</p><ul class="checklist"><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checked checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checklist--item"><p data-spacing="double">At rest encryption (desktop &amp; mobile)</p><ul class="checklist"><li class="checklist--item"><p data-spacing="double">Web (if possible)</p></li><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Desktop</p></li></ul></li><li class="checklist--item"><p data-spacing="double">Refine UI</p></li><li class="checked checklist--item"><p data-spacing="double">Yearly reminders</p><ul class="checklist"><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checked checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checklist--item"><p data-spacing="double">Profile (username, name, picture etc.)</p><ul class="checklist"><li class="checked checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checklist--item"><p data-spacing="double">Image compression &amp; multi select</p><ul class="checklist"><li class="checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Web</p></li></ul></li><li class="checked checklist--item"><p data-spacing="double">Callout component</p></li><li class="checked checklist--item"><p data-spacing="double">Simple checklists</p></li><li class="checklist--item"><p data-spacing="double">Table of contents</p><ul class="checklist"><li class="checklist--item"><p data-spacing="double">Mobile</p></li><li class="checklist--item"><p data-spacing="double">Web</p></li></ul></li></ul>
      </body>
    </html>
    `
	bench('htmldiff', () => {
		HtmlDiff.execute(oldText, newText)
	})

	bench('node-htmldiff', () => {
		diff(oldText, newText)
	})
})
