import { render, screen } from '@testing-library/react';
import { WeatherDisplay } from '../weather-display';

describe('WeatherDisplay', () => {
  it('shows loading state initially', () => {
    render(<WeatherDisplay location="66044" />);
    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });
});