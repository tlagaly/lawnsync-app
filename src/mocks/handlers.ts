import { http, HttpResponse } from 'msw'

const mockWeatherData = {
  temperature: 65,
  condition: "clear sky",
  humidity: 45,
  windSpeed: 8,
  icon: "01d",
};

const mockForecastData = [
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
  {
    date: "3/20/2025",
    temperature: 65,
    condition: "light rain",
    icon: "10d",
  },
  {
    date: "3/21/2025",
    temperature: 62,
    condition: "overcast",
    icon: "04d",
  },
  {
    date: "3/22/2025",
    temperature: 70,
    condition: "clear sky",
    icon: "01d",
  },
];

export const handlers = [
  // Current weather endpoint
  http.get('/api/weather/current', ({ request }) => {
    const url = new URL(request.url);
    const location = url.searchParams.get('location');
    
    if (!location) {
      return new HttpResponse(
        JSON.stringify({ error: 'Location is required' }),
        { status: 400 }
      );
    }

    return HttpResponse.json(mockWeatherData);
  }),

  // Forecast endpoint
  http.get('/api/weather/forecast', ({ request }) => {
    const url = new URL(request.url);
    const location = url.searchParams.get('location');
    
    if (!location) {
      return new HttpResponse(
        JSON.stringify({ error: 'Location is required' }),
        { status: 400 }
      );
    }

    return HttpResponse.json(mockForecastData);
  }),
];