import type { DailyForecast, Units } from "@weather-app/contracts";
import { formatDate, formatDecimal, formatPercent, formatTemperature, formatWindSpeed } from "../../../lib/formatters";
import { WeatherIcon } from "./WeatherIcon";
import { DailyForecastDetails } from "./DailyForecastDetails";
import { formatUvRisk, getWeatherDescription } from "../utils/weather-text";

const hasNumber = (value: number | undefined) => value !== undefined && !Number.isNaN(value);

export function DailyForecastCard({ day, timezone, units }: { day: DailyForecast; timezone?: string; units: Units }) {
  const description = getWeatherDescription(day.condition);
  const highlights = [
    hasNumber(day.probabilityOfPrecipitation) ? ["Precipitación", formatPercent(day.probabilityOfPrecipitation)] : undefined,
    hasNumber(day.uvi) && day.uvi! > 0 ? ["UV", formatUvRisk(day.uvi)] : undefined,
    hasNumber(day.windSpeed) ? ["Viento", formatWindSpeed(day.windSpeed, units)] : undefined,
    hasNumber(day.rain) && day.rain! > 0 ? ["Lluvia", formatDecimal(day.rain, " mm", 1)] : undefined,
    hasNumber(day.snow) && day.snow! > 0 ? ["Nieve", formatDecimal(day.snow, " mm", 1)] : undefined
  ].filter((item): item is [string, string] => Boolean(item?.[1]));

  return (
    <details className="motion-card group min-w-0 rounded-xl border bg-background/70 p-4 transition hover:border-primary/35 hover:bg-background/85 open:border-primary/40">
      <summary className="flex min-w-0 cursor-pointer list-none items-center gap-4">
        <WeatherIcon iconCode={day.condition?.icon} conditionId={day.condition?.id} className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium capitalize">{formatDate(day.date, timezone)}</p>
          {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold">{formatTemperature(day.temperature.max, units)}</p>
          <p className="text-sm text-muted-foreground">{formatTemperature(day.temperature.min, units)}</p>
        </div>
      </summary>
      {highlights.length > 0 && (
        <div className="mt-3 grid min-w-0 gap-2 text-sm sm:grid-cols-3">
          {highlights.map(([label, value]) => (
            <p key={label}>{label}: <span className="font-medium">{value}</span></p>
          ))}
        </div>
      )}
      <DailyForecastDetails day={day} timezone={timezone} units={units} />
    </details>
  );
}
