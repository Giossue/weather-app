import { ArrowClockwise, BookmarkSimple, MapPin } from "@phosphor-icons/react";
import type { CurrentWeather, DailyForecast, Units } from "@weather-app/contracts";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { CachedDataBadge } from "../../../components/common/CachedDataBadge";
import { formatShortDateTime, formatTemperature, formatTime } from "../../../lib/formatters";
import type { SelectedLocation } from "../../../types/location";
import { WeatherIcon } from "./WeatherIcon";
import { getWeatherDescription } from "../utils/weather-text";

export function CurrentWeatherHero({
  current,
  daily,
  location,
  units,
  wasCached,
  onRefresh,
  onAddFavorite,
  canSaveFavorite = true,
  savingFavorite = false,
  refreshing
}: {
  current: CurrentWeather;
  daily?: DailyForecast;
  location: SelectedLocation;
  units: Units;
  wasCached?: boolean;
  onRefresh: () => void;
  onAddFavorite: () => void;
  canSaveFavorite?: boolean;
  savingFavorite?: boolean;
  refreshing?: boolean;
}) {
  const description = getWeatherDescription(current.condition);

  return (
    <Card className="motion-reveal weather-glass-card relative min-w-0 overflow-hidden border-primary/20 bg-card/90 [--reveal-delay:70ms]">
      <CardContent className="relative z-10 grid min-w-0 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
        <div className="min-w-0 space-y-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
              <MapPin size={15} className="shrink-0" /> <span className="truncate">{location.name}{location.country ? `, ${location.country}` : ""}</span>
            </span>
            <CachedDataBadge visible={wasCached} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{formatShortDateTime(current.recordedAt, current.timezone)}</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">{formatTemperature(current.temperature, units)}</h1>
            {description && <p className="mt-2 text-lg text-muted-foreground">{description}</p>}
          </div>
          <div className="grid min-w-0 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>Sensación térmica: <span className="font-medium text-foreground">{formatTemperature(current.feelsLike, units)}</span></p>
            <p>Máx / mín: <span className="font-medium text-foreground">{formatTemperature(daily?.temperature.max, units)} / {formatTemperature(daily?.temperature.min, units)}</span></p>
            <p>Amanecer: <span className="font-medium text-foreground">{formatTime(current.sunrise, current.timezone)}</span></p>
            <p>Atardecer: <span className="font-medium text-foreground">{formatTime(current.sunset, current.timezone)}</span></p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-end">
          <WeatherIcon iconCode={current.condition.icon} conditionId={current.condition.id} className="motion-pop h-[9.2rem] w-[9.2rem] sm:h-[11.5rem] sm:w-[11.5rem] [--reveal-delay:220ms]" />
          <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto">
            {canSaveFavorite && (
              <Button variant="outline" onClick={onAddFavorite} disabled={savingFavorite} className="flex-1 sm:flex-none">
                <BookmarkSimple size={18} /> {savingFavorite ? "Guardando..." : "Guardar"}
              </Button>
            )}
            <Button onClick={onRefresh} disabled={refreshing} className="flex-1 sm:flex-none">
              <ArrowClockwise size={18} className={refreshing ? "animate-spin" : ""} /> Actualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
