---
name: testlink-format
description: |
  How to format text for TestLink fields. TestLink stores rich-text fields
  (summary, preconditions, step actions and expected results) as HTML, so field
  bodies must be written with HTML tags and escaped entities — not plain text or
  \n. Use whenever building or updating a TestLink test case or suite, and as the
  markup reference for testlink-sync.
---

# testlink-format

TestLink rich-text fields are **HTML**. Write field bodies with HTML tags and
escape special characters as entities. Plain text with `\n` line breaks renders
as a literal `n` and lists collapse — always format.

## Tags to use

| Tag | For |
|-----|-----|
| `<p>…</p>` | a paragraph — summaries, a single action, expected results |
| `<strong>…</strong>` | buttons, menu items, field names, key terms |
| `<em>…</em>` | alternatives or clarifications |
| `<ul><li>…</li></ul>` | bullet list — preconditions, validation points |
| `<ol><li>…</li></ol>` | numbered / ordered list |
| `<br>` | a line break inside one field |

## Entities — escape these inside any field body

`>` → `&gt;` · `<` → `&lt;` · `"` → `&quot;` · `&` → `&amp;` · `'` → `&apos;` · non-breaking space → `&nbsp;`

## By field

- **summary** — `<p>`, with `<strong>` on the key action.
  `<p>Verify a user can <strong>log in</strong> with valid credentials</p>`
- **preconditions** — a `<ul><li>` list, one item per `<li>`.
  `<ul><li>Valid user account exists</li><li>Login page is reachable</li></ul>`
- **step actions** — `<p>` for the action, `<strong>` for UI targets, `<em>` for
  an alternative path; nested `<ul><li>`/`<ol><li>` for sub-steps.
  `<p>Click <strong>Save</strong></p>`
- **step expected_results** — `<p>`, or `<ul><li>` when there are several checks.

## Steps array shape

Each step object: `step_number` (e.g. `"1"`), `actions` (HTML), `expected_results`
(HTML), `active` (`1`), `execution_type` (`1`=manual, `2`=automated).

## Avoid

- `\n` for line breaks — use `<br>` or separate tags
- unescaped `<`, `>`, `&`, `"` in body text
- mixing raw plain text with HTML in the same field
