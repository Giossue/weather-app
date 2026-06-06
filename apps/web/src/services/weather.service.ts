import type {
  CurrentWeatherResponse,
  DailyForecast,
  MinuteForecast,
  TimelineForecast,
  Units,
  WeatherAlert,
  WeatherOverview
} from "@weather-app/contracts";
import { apiRequest } from "./api-client";

type WeatherParams = {
  lat: number;
  lon: number;
  units: Units;
  lang: string;
  refresh?: boolean;
};

export const getWeatherOverview = (params: WeatherParams) => apiRequest<WeatherOverview>("/api/weather/overview", { params });
export const getCurrentWeather = (params: WeatherParams) => apiRequest<CurrentWeatherResponse>("/api/weather/current", { params });
export const getMinuteForecast = (params: WeatherParams) => apiRequest<{ data: MinuteForecast[] }>("/api/weather/minutely", { params });
export const getQuarterHourlyForecast = (params: WeatherParams) => apiRequest<{ data: TimelineForecast[] }>("/api/weather/quarter-hourly", { params });
export const getHourlyForecast = (params: WeatherParams) => apiRequest<{ data: TimelineForecast[] }>("/api/weather/hourly", { params });
export const getDailyForecast = (params: WeatherParams) => apiRequest<{ data: DailyForecast[] }>("/api/weather/daily", { params });
export const getWeatherAlert = (alertId: string) => apiRequest<{ data: WeatherAlert }>(`/api/weather/alerts/${encodeURIComponent(alertId)}`);
