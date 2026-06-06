import type { Units } from "@weather-app/contracts";

const normalizeDisplayTemperature = (value: number, units: Units) => {
  if (units === "metric" && value > 170) return value - 273.15;
  if (units === "imperial" && value > 170) return ((value - 273.15) * 9) / 5 + 32;
  return value;
};

export const formatTemperature = (value: number | undefined, units: Units = "metric") => {
  if (value === undefined || Number.isNaN(value)) return "Sin dato";
  const suffix = units === "imperial" ? "°F" : units === "standard" ? "K" : "°C";
  return `${Math.round(normalizeDisplayTemperature(value, units))}${suffix}`;
};

export const formatDecimal = (value: number | undefined, suffix = "", digits = 0) => {
  if (value === undefined || Number.isNaN(value)) return "Sin dato";
  return `${value.toFixed(digits)}${suffix}`;
};

export const formatPercent = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return "Sin dato";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

export const formatWindSpeed = (value: number | undefined, units: Units = "metric") => {
  if (value === undefined || Number.isNaN(value)) return "Sin dato";
  const suffix = units === "imperial" ? "mph" : "m/s";
  return `${value.toFixed(1)} ${suffix}`;
};

export const formatTime = (iso: string | undefined, timezone?: string) => {
  if (!iso) return "Sin dato";
  return new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
  }).format(new Date(iso));
};

export const formatDate = (iso: string | undefined, timezone?: string) => {
  if (!iso) return "Sin dato";
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: timezone
  }).format(new Date(iso));
};

export const formatDayMonth = (iso: string | undefined, timezone?: string) => {
  if (!iso) return "Sin dato";
  const parts = new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone
  }).formatToParts(new Date(iso));
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return day && month ? `${day.padStart(2, "0")}/${month.padStart(2, "0")}` : "Sin dato";
};

export const formatShortDateTime = (iso: string | undefined, timezone?: string) => {
  if (!iso) return "Sin dato";
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
  }).format(new Date(iso));
};

export const windDirectionFromDegrees = (degrees: number | undefined) => {
  if (degrees === undefined || Number.isNaN(degrees)) return "Sin dato";
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return directions[Math.round(degrees / 45) % 8] ?? "N";
};
