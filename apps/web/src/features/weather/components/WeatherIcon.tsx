import { useEffect, useMemo, useState } from "react";
import { cn } from "../../../lib/utils";
import { resolveWeatherIcon } from "../config/weather-icon-map";

export function WeatherIcon({ iconCode, conditionId, className }: { iconCode?: string; conditionId?: number; className?: string }) {
  const resolution = useMemo(() => resolveWeatherIcon({ iconCode, conditionId }), [iconCode, conditionId]);
  const [src, setSrc] = useState(resolution.src);

  useEffect(() => {
    setSrc(resolution.src);
  }, [resolution.src]);

  return (
    <img
      src={src}
      alt={resolution.alt}
      className={cn("h-[4.6rem] w-[4.6rem] object-contain", className)}
      onError={() => setSrc((current) => (current === resolution.fallbackSrc ? "/weather-icons/fallback/weather.svg" : resolution.fallbackSrc))}
    />
  );
}
