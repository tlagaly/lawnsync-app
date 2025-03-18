import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import '@testing-library/jest-dom';
import type { RenderOptions } from '@testing-library/react';

// Extend expect matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveTextContent: (text: string) => R;
      toBeInTheDocument: () => R;
    }
  }
}

// Mock session data
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: typeof mockSession;
}

// Custom render function
export function render(
  ui: React.ReactElement,
  { session = mockSession, ...options }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    );
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...options }),
    user: userEvent.setup(),
  };
}

// Weather test data
export const mockWeatherData = {
  temperature: 65,
  condition: "clear sky",
  humidity: 45,
  windSpeed: 8,
  icon: "01d",
};

export const mockForecastData = [
  {
    date: "3/18/2025",
    temperature: 68,
    condition: "clear sky",
    icon: "01d",
  },
  {
    date: "3/19/2025",
    temperature: 72,
    condition: "partly cloudy",
    icon: "02d",
  },
];

// Weather test assertions
export function assertWeatherDisplay(container: HTMLElement, data = mockWeatherData) {
  expect(container).toHaveTextContent(data.temperature.toString());
  expect(container).toHaveTextContent(data.condition);
  expect(container).toHaveTextContent(data.humidity.toString());
  expect(container).toHaveTextContent(data.windSpeed.toString());
  expect(container.querySelector(`img[alt="${data.condition}"]`)).toBeInTheDocument();
}

export function assertForecastDisplay(container: HTMLElement, data = mockForecastData) {
  data.forEach(day => {
    expect(container).toHaveTextContent(day.temperature.toString());
    expect(container).toHaveTextContent(day.condition);
    expect(container.querySelector(`img[alt="${day.condition}"]`)).toBeInTheDocument();
  });
}

// Re-export everything from RTL and user-event
export * from '@testing-library/react';
export { userEvent };