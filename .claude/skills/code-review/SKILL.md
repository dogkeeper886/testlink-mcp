---
name: code-review
description: |
  Code review guidelines for testlink-mcp server. Use when writing,
  reviewing, or refactoring TypeScript source code in src/ or workflow
  files in .github/workflows/. Covers design patterns, consistency
  rules, and error handling.
---

# Code Review: testlink-mcp

## Core Rule

Fail fast. Keep simple. Every line of code is a liability.

## Consistency Rules (CRITICAL)

These rules prevent the most common implementation mistakes:

1. **Propagate interface changes** — When adding a parameter, option, or input to any interface (function signature, workflow input, API endpoint, config schema), update ALL callers and consumers. Search the entire codebase for call sites before marking the task done.
2. **Treat similar files as a group** — Workflow files, config files, test files, and route handlers that follow the same pattern are a group. A change to one member must be evaluated against all members. Default to applying the change to all.
3. **Single source of truth** — Every configurable value should be defined once and passed through, never hardcoded at call sites. If a reusable workflow accepts an input, all calling workflows must expose and pass that input.
4. **Contract-first changes** — When modifying a shared interface (reusable workflow, library function, API), first update the interface, then update every consumer in the same PR. Never leave consumers out of sync.

## Design Principles

1. **Fail Fast** — Throw immediately on invalid state. No null/undefined returns for errors.
2. **Minimal Validation** — Trust TypeScript types. Validate only at system boundaries.
3. **No Defensive Programming** — Don't check impossible states. Don't add safety nets for theoretical edge cases.
4. **Simple Error Handling** — One error boundary per operation. Let errors bubble up.
5. **Direct Code Flow** — Early returns over nesting. No intermediate variables for single-use values.
6. **Minimal Abstractions** — No wrappers around simple operations. Functions over classes when stateless.
7. **Trust the Platform** — Let TypeScript handle type errors. Let the API validate its own data.

## Established Patterns

1. **Tool Definition** — All tools in single array. snake_case names. Object-type input schema. Required fields explicit.
2. **API Methods** — Single class (TestLinkAPI). All async. Return raw API response. Single error handler (handleAPICall).
3. **Validation** — Validate only at tool entry point. Single validation per parameter. Throw immediately. Reuse validators (DRY).
4. **Error Handling** — Throw Error objects with simple messages (<10 words). Map API error codes. No recovery attempts.
5. **Naming** — Tools: `verb_noun`. Functions: `camelCase`. Classes: `PascalCase`. Constants: `UPPER_SNAKE_CASE`.
6. **Routing** — Single switch for all tools. Direct API calls in each case. Consistent response format.
7. **Workflow inputs** — All reusable workflow inputs must be exposed by every calling workflow. No hardcoded values for configurable options.

## Constraints

- Functions: max 20 lines, max 3 parameters
- Error messages: max 10 words, include relevant ID/value, state what failed
- No console.log/console.error
- No health check endpoints
- No retry logic without specific requirement
- No new abstraction layers
- No new validation helper unless shared by 3+ tools

## Pre-Commit Checklist

Before marking implementation done, verify:

- [ ] All callers of modified interfaces updated
- [ ] All files in the same pattern group reviewed
- [ ] No hardcoded values where a pass-through input exists
- [ ] New options propagated through the full call chain
