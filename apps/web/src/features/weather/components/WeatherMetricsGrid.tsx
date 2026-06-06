import { Cloud, Drop, Eye, Gauge, Moon, Sun, Thermometer, Wind } from "@phosphor-icons/react";
import type { CurrentWeather, Units } from "@weather-app/contracts";
import { formatDecimal, formatTime, formatWindSpeed, windDirectionFromDegrees } from "../../../lib/formatters";
import { WeatherMetricCard } from "./WeatherMetricCard";

export function WeatherMetricsGrid({ current, units }: { current: CurrentWeather; units: Units }) {
  const metrics = [
    { label: "Humedad", value: formatDecimal(current.humidity, "%"), icon: Drop },
    { label: "Índice UV", value: formatDecimal(current.uvi, "", 1), icon: Sun },
    { label: "Presión", value: formatDecimal(current.pressure, " hPa"), icon: Gauge },
    { label: "Visibilidad", value: current.visibility ? `${(current.visibility / 1000).toFixed(1)} km` : "Sin dato", icon: Eye },
    { label: "Nubosidad", value: formatDecimal(current.clouds, "%"), icon: Cloud },
    { label: "Punto de rocío", value: formatDecimal(current.dewPoint, "°", 1), icon: Thermometer },
    { label: "Viento", value: formatWindSpeed(current.windSpeed, units), helper: windDirectionFromDegrees(current.windDeg), icon: Wind },
    { label: "Ráfagas", value: formatWindSpeed(current.windGust, units), icon: Wind },
    { label: "Lluvia reciente", value: formatDecimal(current.rainLastHour, " mm", 1), icon: Drop },
    { label: "Nieve reciente", value: formatDecimal(current.snowLastHour, " mm", 1), icon: Cloud },
    { label: "Amanecer", value: formatTime(current.sunrise, current.timezone), icon: Sun },
    { label: "Atardecer", value: formatTime(current.sunset, current.timezone), icon: Moon }
  ];

  return <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((metric) => <WeatherMetricCard key={metric.label} {...metric} />)}</div>;
}
