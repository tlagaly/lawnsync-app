# System Patterns

## Authentication Patterns

### Component Structure
```typescript
// Client Components (with "use client" directive)
- Form components that need React hooks
- Interactive UI components
- Components that use browser APIs

// Server Components (default)
- Layout components
- Static UI components
- Data fetching components
```

### Form Validation Pattern
```typescript
// 1. Define Zod schema
const formSchema = z.object({
  field: z.string().min(1, "Error message"),
});

// 2. Use with React Hook Form
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    field: "",
  },
});

// 3. Handle submission
async function onSubmit(values: z.infer<typeof formSchema>) {
  try {
    // API call
  } catch (error) {
    // Error handling
  }
}
```

### Protected Routes Pattern
```typescript
// 1. Use middleware for route protection
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// 2. Define protected paths
export const config = {
  matcher: ["/protected-path/:path*"],
};
```

### Error Handling Pattern
```typescript
// API Routes
try {
  // Operation
  return NextResponse.json(data, { status: 2xx });
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { error: "Something went wrong" },
    { status: 500 }
  );
}

// Client Components
try {
  // Operation
} catch (error) {
  setError(error instanceof Error ? error.message : "Something went wrong");
} finally {
  setLoading(false);
}
```

### Form Component Pattern
```typescript
// 1. Import shadcn components
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// 2. Structure form fields
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Loading State Pattern
```typescript
// 1. Define loading state
const [isLoading, setIsLoading] = useState(false);

// 2. Use in forms and buttons
<Button disabled={isLoading}>
  {isLoading ? "Loading..." : "Submit"}
</Button>

// 3. Handle in form fields
<Input disabled={isLoading} />
```

## Best Practices

### Authentication
1. Always hash passwords before storage
2. Use environment variables for secrets
3. Implement proper error messages
4. Add loading states for better UX
5. Validate inputs on both client and server

### Form Handling
1. Use Zod for validation
2. Implement proper error handling
3. Show loading states during submission
4. Disable form during submission
5. Use proper autocomplete attributes

### Component Organization
1. Keep form logic in separate components
2. Use client components only when necessary
3. Leverage server components for static content
4. Keep authentication logic in dedicated files
5. Use consistent naming conventions

### Security
1. Validate all inputs
2. Protect sensitive routes
3. Handle errors gracefully
4. Use secure password storage
5. Implement proper session management