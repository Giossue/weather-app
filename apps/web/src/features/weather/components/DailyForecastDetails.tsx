import type { DailyForecast, Units } from "@weather-app/contracts";
import { formatDecimal, formatTemperature, formatTime, formatWindSpeed, windDirectionFromDegrees } from "../../../lib/formatters";

type DetailRow = [string, string];

const hasNumber = (value: number | undefined) => value !== undefined && !Number.isNaN(value);
const hasText = (value: string) => value !== "Sin dato";

export function DailyForecastDetails({ day, timezone, units }: { day: DailyForecast; timezone?: string; units: Units }) {
  const rows: Array<DetailRow | undefined> = [
    day.sunrise ? ["Amanecer", formatTime(day.sunrise, timezone)] : undefined,
    day.sunset ? ["Atardecer", formatTime(day.sunset, timezone)] : undefined,
    day.moonrise ? ["Salida lunar", formatTime(day.moonrise, timezone)] : undefined,
    day.moonset ? ["Puesta lunar", formatTime(day.moonset, timezone)] : undefined,
    hasNumber(day.moonPhase) ? ["Fase lunar", formatDecimal(day.moonPhase, "", 2)] : undefined,
    hasNumber(day.temperature.morning) ? ["Mañana", formatTemperature(day.temperature.morning, units)] : undefined,
    hasNumber(day.temperature.day) ? ["Día", formatTemperature(day.temperature.day, units)] : undefined,
    hasNumber(day.temperature.evening) ? ["Tarde", formatTemperature(day.temperature.evening, units)] : undefined,
    hasNumber(day.temperature.night) ? ["Noche", formatTemperature(day.temperature.night, units)] : undefined,
    hasNumber(day.feelsLike?.day) ? ["Sensación día", formatTemperature(day.feelsLike?.day, units)] : undefined,
    hasNumber(day.pressure) ? ["Presión", formatDecimal(day.pressure, " hPa")] : undefined,
    hasNumber(day.humidity) ? ["Humedad", formatDecimal(day.humidity, "%")] : undefined,
    hasNumber(day.clouds) ? ["Nubosidad", formatDecimal(day.clouds, "%")] : undefined,
    hasNumber(day.windGust) ? ["Ráfagas", formatWindSpeed(day.windGust, units)] : undefined,
    hasNumber(day.windSpeed) ? ["Viento", `${formatWindSpeed(day.windSpeed, units)} ${windDirectionFromDegrees(day.windDeg)}`] : undefined,
    hasNumber(day.rain) && day.rain! > 0 ? ["Lluvia", formatDecimal(day.rain, " mm", 1)] : undefined,
    hasNumber(day.snow) && day.snow! > 0 ? ["Nieve", formatDecimal(day.snow, " mm", 1)] : undefined
  ];

  const visibleRows = rows.filter((row): row is DetailRow => row !== undefined && hasText(row[1]));

  if (visibleRows.length === 0) return null;

  return (
    <div className="mt-4 grid min-w-0 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {visibleRows.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-muted/60 p-3 transition group-open:bg-muted/80">
          <p className="truncate text-muted-foreground">{label}</p>
          <p className="break-words font-medium">{value}</p>
        </div>
      ))}
    </div>
  );
}
