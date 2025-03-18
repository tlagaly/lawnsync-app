# System Patterns

## Testing Patterns

### API Testing
1. **Request Mocking**
   ```typescript
   class MockNextRequest extends NextRequest {
     private mockBody: string;
   
     constructor(url: string, options: { method: string; body?: any }) {
       super(url, { method: options.method });
       this.mockBody = options.body ? 
         (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) 
         : '';
     }
   
     async text() { return this.mockBody; }
     async json() { return JSON.parse(this.mockBody); }
   }
   ```

2. **Response Mocking**
   ```typescript
   const createMockResponse = (data: any, status = 200) => ({
     status,
     json: async () => data,
     text: async () => JSON.stringify(data),
     headers: new Headers(),
     ok: status >= 200 && status < 300,
   });
   ```

3. **Debug Logging**
   ```typescript
   const debug = {
     log: (message: string, ...args: any[]) => 
       console.log('[DEBUG]', message, ...args),
     error: (message: string, ...args: any[]) => 
       console.error('[DEBUG ERROR]', message, ...args),
   };
   ```

### Error Handling
1. **Input Validation**
   ```typescript
   // Required fields validation
   if (!profile || !conditions) {
     return Response.json(
       { error: 'Missing required fields' },
       { status: 400 }
     );
   }

   // Field type validation
   if (typeof value !== 'number' || value <= 0) {
     return Response.json(
       { error: 'Invalid value' },
       { status: 400 }
     );
   }
   ```

2. **Service Errors**
   ```typescript
   try {
     const result = await service.operation();
     if (!result) {
       return Response.json(
         { error: 'Service unavailable' },
         { status: 503 }
       );
     }
   } catch (error) {
     if (error.type === 'rate_limit_error') {
       return Response.json(
         { error: error.message },
         { status: 429 }
       );
     }
     return Response.json(
       { error: 'Internal error' },
       { status: 500 }
     );
   }
   ```

3. **Test Coverage**
   - Success cases
   - Input validation
   - Service errors
   - Network errors
   - Rate limiting
   - Invalid data

## API Patterns

### Request Validation
1. Check required fields
2. Validate field types
3. Validate field ranges
4. Return clear error messages

### Response Structure
1. Success response: `{ data: T }`
2. Error response: `{ error: string }`
3. Consistent status codes:
   - 200: Success
   - 400: Invalid input
   - 429: Rate limit
   - 500: Server error
   - 503: Service unavailable

### Error Handling
1. Catch and categorize errors
2. Return appropriate status codes
3. Provide clear error messages
4. Log errors for debugging