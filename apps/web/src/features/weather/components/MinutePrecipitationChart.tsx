import { CloudRain, Drop, Info, Wind } from "@phosphor-icons/react";
import type { MinuteForecast, TimelineForecast, Units } from "@weather-app/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { formatPercent, formatTemperature, formatTime, formatWindSpeed } from "../../../lib/formatters";

const getIntensity = (max: number) => {
  if (max <= 0.05) return { label: "Sin lluvia", text: "No se esperan precipitaciones durante la próxima hora" };
  if (max < 1) return { label: "Lluvia leve", text: "Puede aparecer lluvia ligera en la próxima hora" };
  if (max < 4) return { label: "Lluvia moderada", text: "Se esperan precipitaciones moderadas en la próxima hora" };
  return { label: "Lluvia intensa", text: "Hay señales de lluvia intensa. Revisa las alertas si existen" };
};

export function MinutePrecipitationChart({ items, loading, fallbackHourly = [], timezone, units = "metric" }: { items?: MinuteForecast[]; loading?: boolean; fallbackHourly?: TimelineForecast[]; timezone?: string; units?: Units }) {
  if (loading) {
    return <Card className="motion-reveal weather-glass-card"><CardContent className="p-5 text-sm text-muted-foreground">Cargando precipitación inmediata...</CardContent></Card>;
  }

  const data = items ?? [];
  const nextHour = fallbackHourly[0];
  const max = Math.max(0, ...data.map((item) => item.precipitationMmPerHour));
  const total = data.reduce((sum, item) => sum + item.precipitationMmPerHour / 60, 0);
  const intensity = getIntensity(max);

  if (data.length === 0) {
    return (
      <Card className="motion-reveal weather-glass-card min-w-0 overflow-hidden [--reveal-delay:80ms]">
        <CardHeader>
          <CardTitle>Precipitación inmediata</CardTitle>
          <CardDescription>No hay información minuto a minuto para esta ubicación.</CardDescription>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-background/70 p-4">
            <Info className="mb-3 text-primary" size={24} />
            <p className="font-medium">Sin datos por minuto</p>
            <p className="mt-1 text-sm text-muted-foreground">No hay información de precipitación inmediata para esta ubicación.</p>
          </div>
          <div className="rounded-xl border bg-background/70 p-4">
            <CloudRain className="mb-3 text-primary" size={24} />
            <p className="font-medium">Próxima hora</p>
            <p className="mt-1 text-sm text-muted-foreground">{nextHour ? `${formatPercent(nextHour.probabilityOfPrecipitation)} de lluvia cerca de ${formatTime(nextHour.time, timezone)}` : "Sin pronóstico horario disponible."}</p>
          </div>
          <div className="rounded-xl border bg-background/70 p-4">
            <Wind className="mb-3 text-primary" size={24} />
            <p className="font-medium">Ambiente</p>
            <p className="mt-1 text-sm text-muted-foreground">{nextHour ? `${formatTemperature(nextHour.temperature, units)} · viento ${formatWindSpeed(nextHour.windSpeed, units)}` : "Sin lectura adicional."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="motion-reveal weather-glass-card min-w-0 overflow-hidden [--reveal-delay:80ms]">
      <CardHeader>
        <CardTitle>Precipitación inmediata</CardTitle>
        <CardDescription>{intensity.text}</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-muted/60 p-4">
          <span className="inline-flex items-center gap-2 font-medium"><Drop size={18} className="text-primary" /> {intensity.label}</span>
          <span className="text-right text-sm text-muted-foreground">Total estimado: {total.toFixed(2)} mm</span>
        </div>
        <div className="flex h-28 min-w-0 items-end gap-1 overflow-hidden rounded-xl border bg-background/70 p-3">
          {data.slice(0, 60).map((item, index) => (
            <div
              key={`${item.time}-${index}`}
              className="precipitation-bar flex-1 rounded-t bg-primary/70"
              style={{ height: `${max > 0 ? Math.max(4, (item.precipitationMmPerHour / max) * 100) : 4}%`, animationDelay: `${index * 12}ms` }}
              title={`${index + 1} min: ${item.precipitationMmPerHour.toFixed(2)} mm/h`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
