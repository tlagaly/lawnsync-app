import { WeatherData, getWeatherIconUrl, isOutdoorTaskRecommended } from './weather';

describe('Weather Utils', () => {
  describe('getWeatherIconUrl', () => {
    it('returns correct URL for icon code', () => {
      const url = getWeatherIconUrl('01d');
      expect(url).toBe('https://openweathermap.org/img/wn/01d@2x.png');
    });
  });

  describe('isOutdoorTaskRecommended', () => {
    const baseWeather: WeatherData = {
      temperature: 70,
      condition: 'clear sky',
      humidity: 50,
      windSpeed: 5,
      precipitation: 0,
      icon: '01d',
      date: new Date().toISOString(),
    };

    it('recommends tasks in good weather', () => {
      expect(isOutdoorTaskRecommended(baseWeather)).toBe(true);
    });

    it('does not recommend tasks in rain', () => {
      const rainyWeather: WeatherData = {
        ...baseWeather,
        condition: 'light rain',
        precipitation: 30,
      };
      expect(isOutdoorTaskRecommended(rainyWeather)).toBe(false);
    });

    it('does not recommend tasks in extreme temperatures', () => {
      const coldWeather: WeatherData = {
        ...baseWeather,
        temperature: 40,
      };
      expect(isOutdoorTaskRecommended(coldWeather)).toBe(false);

      const hotWeather: WeatherData = {
        ...baseWeather,
        temperature: 90,
      };
      expect(isOutdoorTaskRecommended(hotWeather)).toBe(false);
    });

    it('does not recommend tasks in high wind', () => {
      const windyWeather: WeatherData = {
        ...baseWeather,
        windSpeed: 20,
      };
      expect(isOutdoorTaskRecommended(windyWeather)).toBe(false);
    });

    it('does not recommend tasks in snow', () => {
      const snowyWeather: WeatherData = {
        ...baseWeather,
        condition: 'light snow',
        temperature: 30,
        precipitation: 50,
      };
      expect(isOutdoorTaskRecommended(snowyWeather)).toBe(false);
    });
  });
});