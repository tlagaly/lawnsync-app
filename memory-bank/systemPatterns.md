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

## Development Environment Patterns

### Auto-Login Pattern
```typescript
// 1. Environment detection
const isProduction = process.env.NODE_ENV === "production";

// 2. Test user configuration
const TEST_USER = {
  email: "test@example.com",
  password: "password123",
  name: "Test User"
};

// 3. Auto-login component
function AutoSignIn() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    async function initializeTestUser() {
      if (!isProduction && !session) {
        await setupTestEnvironment();
        await signIn("credentials", {
          email: TEST_USER.email,
          password: TEST_USER.password,
          redirect: false,
        });
      }
    }
    initializeTestUser();
  }, [session]);

  return null;
}

// 4. Setup endpoint pattern
async function setupTestEnvironment() {
  if (isProduction) return;
  
  try {
    const user = await db.user.findUnique({
      where: { email: TEST_USER.email },
    });

    if (!user) {
      await db.user.create({
        data: {
          email: TEST_USER.email,
          password: await hash(TEST_USER.password, 10),
          name: TEST_USER.name,
        },
      });
    }
  } catch (error) {
    console.error("Setup error:", error);
  }
}
```

### Development Best Practices
1. Use environment detection for features
2. Maintain consistent test data
3. Automate development setup
4. Keep production code clean
5. Document development utilities

## Calendar Component Patterns

### Calendar Day Cell Pattern
```typescript
// 1. Custom day cell component
function DayCell({ date, displayMonth, tasks }: DayCellProps) {
  const hasWeatherWarning = tasks.some(task => task.weatherAdjusted);
  const isOutsideMonth = date.getMonth() !== displayMonth.getMonth();

  return (
    <div className="relative w-full h-full group hover:bg-accent/10">
      <div className="absolute top-1 right-1 flex gap-0.5">
        {tasks.map((task) => (
          <PriorityIndicator key={task.id} priority={task.priority} />
        ))}
      </div>
      <div className={cn(
        "flex items-center justify-center text-sm p-2",
        isOutsideMonth && "text-muted-foreground opacity-50"
      )}>
        {date.getDate()}
      </div>
      {hasWeatherWarning && (
        <WeatherWarningIndicator />
      )}
    </div>
  );
}

// 2. Priority indicator component
function PriorityIndicator({ priority }: { priority: string }) {
  return (
    <div className={cn(
      "w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-110",
      getPriorityColorClass(priority)
    )} />
  );
}
```

### Calendar State Management Pattern
```typescript
// 1. State and data fetching
const [selectedDate, setSelectedDate] = useState<Date>();
const [tasks, setTasks] = useState<Task[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// 2. Error handling
if (error === "Unauthorized") {
  return <AuthenticationPrompt />;
}

if (error) {
  return <ErrorDisplay message={error} />;
}

// 3. Loading state
if (isLoading) {
  return <LoadingSpinner />;
}
```

### Calendar Integration Pattern
```typescript
// 1. Calendar configuration
<Calendar
  mode="single"
  selected={selectedDate}
  onSelect={setSelectedDate}
  modifiers={{
    hasTask: (date) => getTasksForDate(date).length > 0,
    completed: (date) => hasCompletedTasks(date),
    weatherWarning: (date) => hasWeatherWarning(date),
  }}
  modifiersClassNames={{
    hasTask: "font-bold",
    completed: "bg-green-50",
    weatherWarning: "relative",
  }}
  components={{
    Day: DayCell,
  }}
/>
```

## Weather Integration Patterns

### API Integration Pattern
```typescript
// 1. Environment configuration
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// 2. Type definitions with Zod
const WeatherDataSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  icon: z.string(),
});

// 3. API wrapper function
async function getCurrentWeather(location: string): Promise<WeatherData> {
  if (!API_KEY) throw new Error("API key not configured");
  
  const response = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=imperial`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();
  return WeatherDataSchema.parse(data);
}
```

### Weather Display Pattern
```typescript
// 1. Client component with data fetching
"use client";

function WeatherDisplay({ location }: { location: string }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  // 2. Error boundary pattern
  if (error) return <ErrorDisplay message={error} />;
  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  // 3. Render weather data
  return (
    <WeatherCard>
      <CurrentConditions data={data} />
      <Forecast location={location} />
    </WeatherCard>
  );
}
```

### Task Recommendation Pattern
```typescript
// 1. Weather condition assessment
function isOutdoorTaskRecommended(weather: WeatherData): boolean {
  const badConditions = ["rain", "snow", "thunderstorm"];
  
  return (
    !badConditions.includes(weather.condition) &&
    weather.temperature >= 50 &&
    weather.temperature <= 85 &&
    weather.windSpeed < 15
  );
}

// 2. Task filtering
function filterTasks(tasks: Task[], weather: WeatherData): Task[] {
  return tasks.filter(task =>
    task.isOutdoor ? isOutdoorTaskRecommended(weather) : true
  );
}
```