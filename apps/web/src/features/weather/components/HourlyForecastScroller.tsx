import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { TimelineForecast, Units } from "@weather-app/contracts";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { formatDayMonth, formatPercent, formatTemperature, formatTime, formatWindSpeed } from "../../../lib/formatters";
import { getWeatherDescription } from "../utils/weather-text";
import { WeatherIcon } from "./WeatherIcon";

export function HourlyForecastScroller({ items, timezone, units }: { items: TimelineForecast[]; timezone?: string; units: Units }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollerRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(element.scrollLeft > 8);
    setCanScrollRight(element.scrollLeft < maxScroll - 8);
  }, []);

  const scrollByPage = (direction: "left" | "right") => {
    const element = scrollerRef.current;
    if (!element) return;
    element.scrollBy({ left: direction === "left" ? -element.clientWidth * 0.85 : element.clientWidth * 0.85, behavior: "smooth" });
  };

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();
    const frame = requestAnimationFrame(updateScrollState);
    element.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [items.length, updateScrollState]);

  return (
    <Card className="motion-reveal weather-glass-card min-w-0 overflow-hidden [--reveal-delay:180ms]">
      <CardHeader>
        <CardTitle>Pronóstico por hora</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden">
        <div className="relative min-w-0 overflow-hidden">
          <Button
            size="icon"
            variant="outline"
            aria-label="Ver horas anteriores"
            onClick={() => scrollByPage("left")}
            className={`absolute left-1 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-background/75 shadow-md backdrop-blur transition ${canScrollLeft ? "opacity-80 hover:opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <CaretLeft size={18} weight="bold" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Ver próximas horas"
            onClick={() => scrollByPage("right")}
            className={`absolute right-1 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-background/75 shadow-md backdrop-blur transition ${canScrollRight ? "opacity-80 hover:opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <CaretRight size={18} weight="bold" />
          </Button>
          <ScrollArea className="w-full pb-3" viewportRef={scrollerRef} viewportClassName="pb-4" scrollBarOrientation="horizontal" type="always">
            <div className="flex w-max snap-x gap-3 px-1 pb-1">
              {items.map((item) => {
                const description = getWeatherDescription(item.condition);
                return (
                  <div key={item.time} className="motion-card hourly-forecast-card w-32 shrink-0 snap-start rounded-xl border bg-background/70 p-3 text-center">
                    <p className="text-xs font-medium text-muted-foreground">{formatDayMonth(item.time, timezone)}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{formatTime(item.time, timezone)}</p>
                    <WeatherIcon iconCode={item.condition?.icon} conditionId={item.condition?.id} className="mx-auto my-2 h-14 w-14" />
                    <p className="text-lg font-semibold">{formatTemperature(item.temperature, units)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatPercent(item.probabilityOfPrecipitation)} lluvia</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatWindSpeed(item.windSpeed, units)}</p>
                    {description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
