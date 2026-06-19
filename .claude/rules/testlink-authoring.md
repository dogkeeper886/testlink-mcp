---
paths:
  - ".claude/skills/testlink-format/**"
  - ".claude/skills/testlink-review/**"
  - ".claude/skills/testlink-sync/**"
---

# testlink-authoring

The three `testlink-*` skills that turn a **source document** into **trustworthy
TestLink content**. Same producer → review discipline as `dev-workflow` and
`qa-workflow`: nothing is written without a pass that reads it back.

## The flow

```
   a source document — a spec, a GitHub issue, a docs/tests/TS-*.md (or a folder of them)
            │
            ▼
   testlink-sync ──────► testlink-review    create/update the entities the doc implies;
            │                                 then read them back — PASS / FIX
            │  (every rich-text field)
            ▼
   testlink-format                          the HTML markup contract both rely on
```

## Producer → review pairing

| Producer | Review | Covers |
|----------|--------|--------|
| `testlink-sync` | `testlink-review` | the write met the goal — entities exist, fields correct and well-formed, faithful to the source |

`testlink-format` is neither — it is the **shared reference**: TestLink rich-text
fields are HTML, so both skills format field bodies through it. No producer ships
without a review covering its output.

## What this is — and where it sits

- **Owns:** pushing a document *into* TestLink (requirements, suites, cases, plans,
  builds) and verifying it landed. The document is the source of truth; TestLink is
  brought into line with it.
- **Upstream:** `qa-workflow` authors the `docs/tests/*.md` this can consume — but any
  document that describes test intent is a valid source.
- **Not this:** `testlink-mcp-code` is for changing the MCP **server** code — a
  different concern, not part of the authoring triad.
