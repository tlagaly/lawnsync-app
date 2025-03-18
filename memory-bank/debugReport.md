# Debug Report: MSW Response Handling Issue

## Problem Description
Tests are failing with two related issues:
1. `TypeError: body.stream.tee is not a function or its return value is not iterable`
2. Test timeouts after 10 seconds

## Analysis

### Error Pattern
- Error occurs consistently in MSW's response interceptor
- Happens during Response.clone() operation
- Affects all tests that make HTTP requests
- Logs show MSW server starts and resets correctly, but fails during request handling

### Root Cause
The primary issue is an incompatibility between MSW v2's response handling and Undici's fetch implementation:

1. MSW v2 attempts to clone response bodies using `body.stream.tee()`
2. Undici's fetch implementation doesn't provide a teeable stream
3. This causes the TypeError and prevents responses from being processed
4. The failed response handling leads to test timeouts

### Evidence
1. Error stack trace consistently shows:
```
at cloneBody (node_modules/undici/lib/web/fetch/body.js:294:36)
at cloneResponse (node_modules/undici/lib/web/fetch/response.js:355:24)
at Response.clone (node_modules/undici/lib/web/fetch/response.js:244:28)
at Object.onResponse (node_modules/@mswjs/interceptors/src/interceptors/fetch/index.ts:119:34)
```

2. Diagnostic logs show:
- MSW server starts successfully
- Server state is managed correctly
- Error occurs during request handling
- No response is ever received due to cloning failure

## Proposed Fix Strategy
1. Update MSW handlers to use `passthrough()` for response creation
2. Modify response handling to avoid cloning where possible
3. Update MSW configuration to use compatible response formats

Would you like me to proceed with implementing these fixes in Code mode?