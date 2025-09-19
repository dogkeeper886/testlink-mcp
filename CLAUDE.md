# TestLink MCP Server - Code Review Guidelines

## Core Philosophy: Fail Fast, Keep Simple

### Design Principles

1. **Fail Fast**
   - Throw errors immediately when something is wrong
   - Don't return null or undefined to indicate failure
   - Let the process crash and restart cleanly
   - No silent failures or fallback values

2. **Minimal Validation**
   - Trust TypeScript type system
   - Validate only at system boundaries (user input, API responses)
   - Don't validate what's already been validated
   - Skip format checking if the API will check it anyway

3. **No Defensive Programming**
   - Don't check for impossible states
   - Don't add safety nets for theoretical edge cases
   - Trust function contracts and types
   - Assume happy path unless proven otherwise

4. **No Health Checks**
   - Don't ping services to check if they're alive
   - Don't pre-validate connections
   - Just try the operation and handle actual failures
   - Let connection errors surface naturally

5. **Simple Error Handling**
   - One error boundary per request/operation
   - Don't catch errors just to log them
   - Don't wrap every function in try-catch
   - Let errors bubble up to the appropriate handler

6. **Direct Code Flow**
   - Early returns over nested conditions
   - Throw immediately on invalid state
   - No intermediate variables for single-use values
   - Linear execution path whenever possible

7. **Minimal Abstractions**
   - No wrappers around simple operations
   - No factory patterns for single implementations
   - No service layers that just forward calls
   - Functions over classes when stateless

8. **Trust the Platform**
   - Let JavaScript/TypeScript handle type errors
   - Let the API validate its own data
   - Let Docker handle process restarts
   - Let the MCP protocol handle transport errors

## Code Review Checklist

### MUST Have
- [ ] Errors thrown immediately on invalid state
- [ ] No null/undefined returns for error cases
- [ ] Functions under 20 lines
- [ ] Single responsibility per function
- [ ] Clear error messages (under 10 words)
- [ ] No console.log or console.error statements
- [ ] Direct returns without unnecessary variables

### MUST NOT Have
- [ ] Health check endpoints or functions
- [ ] Defensive null/undefined checks throughout code
- [ ] Try-catch blocks around every operation
- [ ] Validation of already-validated data
- [ ] Multiple validation checks for same condition
- [ ] Abstract base classes with single implementation
- [ ] Success logging or debug statements
- [ ] Configuration validation beyond presence check
- [ ] Retry logic without specific requirement

### Review Questions
1. Can this validation be removed without breaking functionality?
2. Will TypeScript catch this error at compile time?
3. Is this abstraction used more than once?
4. Can this error handling be moved to a higher level?
5. Does this check protect against an actual observed failure?
6. Can we let this operation fail naturally instead of checking first?
7. Is this complexity justified by actual requirements?

## Implementation Standards

### Function Design
- Maximum 20 lines per function
- Maximum 3 parameters per function
- Single return statement when possible
- No nested callbacks or promises

### Error Messages
- Maximum 10 words
- Include relevant ID or value
- State what failed, not why
- No stack traces in messages

### API Interactions
- Direct calls without wrappers
- Let API errors surface as-is
- No response transformation unless required
- Trust API validation and error messages

### Testing Approach
- Test happy path thoroughly
- Test actual observed error cases
- Skip theoretical edge cases
- No tests for impossible states

## Design Pattern Consistency

### Established Patterns

1. **Tool Definition Pattern**
   - All tools defined in single array
   - Consistent naming: snake_case for tool names
   - Input schema always uses object type
   - Required fields explicitly listed

2. **API Method Pattern**
   - Single API class (TestLinkAPI)
   - All API methods are async
   - Return raw API response (no transformation)
   - Single error handler wrapper (handleAPICall)

3. **Validation Pattern**
   - Validate only at tool entry point
   - Single validation per parameter type
   - Throw immediately on invalid input
   - Reuse validation functions (DRY)

4. **Error Handling Pattern**
   - Throw Error objects with simple messages
   - Map API error codes to user-friendly messages
   - No error recovery attempts
   - Let MCP protocol handle transport errors

5. **Naming Conventions**
   - Tools: verb_noun format (read_test_case, create_test_suite)
   - Functions: camelCase (validateTestCaseId, parseTestCaseId)
   - Classes: PascalCase (TestLinkAPI)
   - Constants: UPPER_SNAKE_CASE (TESTLINK_URL, TESTLINK_API_KEY)

6. **Switch Case Pattern**
   - Single switch for all tool routing
   - Direct API method calls in each case
   - Consistent response format
   - Single error handler for all tools

### Consistency Checklist

- [ ] New tools follow verb_noun naming pattern
- [ ] API methods return raw responses without transformation
- [ ] Validation happens only once per parameter
- [ ] Error messages under 10 words
- [ ] No new abstraction layers introduced
- [ ] Switch case added for new tool
- [ ] Tool schema matches existing patterns
- [ ] No new validation helper unless shared by 3+ tools

## Anti-Patterns to Avoid

1. **Defensive Validation Chains**: Multiple checks for related conditions
2. **Null Propagation**: Returning null through multiple layers
3. **Silent Failures**: Catching errors without re-throwing
4. **Preemptive Checks**: Validating before attempting operation
5. **Over-Engineering**: Creating abstractions for future possibilities
6. **Logging Everything**: Debug statements in production code
7. **Configuration Validation**: Checking configuration format/structure
8. **Wrapper Services**: Service classes that only forward calls

## Decision Framework

When reviewing code, ask:
- **Is it simple?** Can a junior developer understand it?
- **Does it fail fast?** Will errors surface immediately?
- **Is it necessary?** Does it solve an actual problem?
- **Is it direct?** Is this the shortest path to the solution?

## Metrics for Success

- Average function length: <10 lines
- Try-catch blocks: <5 per file
- Validation functions: <10% of codebase
- Abstraction layers: Maximum 2
- Error handling code: <15% of total
- Time to error: <100ms from invalid input

---

*Remember: Every line of code is a liability. The best code is no code.*