import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { WeatherAlertBanner } from "../features/alerts/components/WeatherAlertBanner";
import { LocationDeniedState } from "../features/locations/components/LocationDeniedState";
import { MinutePrecipitationChart } from "../features/weather/components/MinutePrecipitationChart";
import { resolveWeatherIcon } from "../features/weather/config/weather-icon-map";
import { formatDayMonth, formatTemperature, formatTime } from "../lib/formatters";

describe("weather icon map", () => {
  test("selects custom day icon", () => {
    const icon = resolveWeatherIcon({ iconCode: "10d", conditionId: 500 });
    expect(icon.src).toBe("/weather-icons/custom/day/10d.svg");
    expect(icon.alt).toContain("lluvia");
  });

  test("provides fallback icon path", () => {
    const icon = resolveWeatherIcon({ conditionId: 999 });
    expect(icon.fallbackSrc).toBe("/weather-icons/fallback/03.svg");
  });
});

describe("formatters", () => {
  test("formats temperatures", () => {
    expect(formatTemperature(21.7, "metric")).toBe("22°C");
    expect(formatTemperature(undefined, "metric")).toBe("Sin dato");
  });

  test("formats time by timezone", () => {
    expect(formatTime("2024-01-01T12:00:00.000Z", "America/Guayaquil")).toContain("07");
  });

  test("formats day and month", () => {
    expect(formatDayMonth("2024-02-24T12:00:00.000Z", "America/Guayaquil")).toBe("24/02");
  });
});

describe("render states", () => {
  test("renders no rain state", () => {
    const html = renderToString(<MinutePrecipitationChart items={[{ time: "2024-01-01T00:00:00.000Z", precipitationMmPerHour: 0, alertIds: [] }]} />);
    expect(html).toContain("No se esperan precipitaciones");
  });

  test("renders alert banner", () => {
    const html = renderToString(<WeatherAlertBanner alerts={[{ id: "abc", event: "Lluvia fuerte" }]} onSelect={() => undefined} />);
    expect(html).toContain("meteorológica");
  });

  test("renders location denied state", () => {
    const html = renderToString(<LocationDeniedState message="Permiso de ubicación rechazado" />);
    expect(html).toContain("Ubicación no disponible");
  });
});
