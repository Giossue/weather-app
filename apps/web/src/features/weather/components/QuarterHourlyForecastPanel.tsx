import type { TimelineForecast, Units } from "@weather-app/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { formatPercent, formatTemperature, formatTime, formatWindSpeed } from "../../../lib/formatters";
import { getWeatherDescription } from "../utils/weather-text";
import { WeatherIcon } from "./WeatherIcon";

export function QuarterHourlyForecastPanel({ items, timezone, units, loading }: { items?: TimelineForecast[]; timezone?: string; units: Units; loading?: boolean }) {
  if (loading) {
    return <Card className="motion-reveal weather-glass-card"><CardContent className="p-5 text-sm text-muted-foreground">Cargando vista cada 15 minutos...</CardContent></Card>;
  }

  return (
    <Card className="motion-reveal weather-glass-card min-w-0 overflow-hidden [--reveal-delay:80ms]">
      <CardHeader>
        <CardTitle>Cambios cada 15 minutos</CardTitle>
        <CardDescription>Vista detallada de corto plazo bajo demanda.</CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(items ?? []).slice(0, 16).map((item) => {
          const description = getWeatherDescription(item.condition);
          return (
            <div key={item.time} className="motion-card hourly-forecast-card min-w-0 rounded-xl border bg-background/70 p-3">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="truncate font-medium">{formatTime(item.time, timezone)}</p>
                <WeatherIcon iconCode={item.condition?.icon} conditionId={item.condition?.id} className="h-12 w-12 shrink-0" />
              </div>
              <p className="mt-2 text-lg font-semibold">{formatTemperature(item.temperature, units)}</p>
              <p className="text-sm text-muted-foreground">Lluvia {formatPercent(item.probabilityOfPrecipitation)}</p>
              <p className="text-sm text-muted-foreground">Viento {formatWindSpeed(item.windSpeed, units)}</p>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
          );
        })}
        {(items ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sin registros disponibles para esta ubicación.</p>}
      </CardContent>
    </Card>
  );
}
