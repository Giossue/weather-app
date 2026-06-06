import type { DailyForecast, Units } from "@weather-app/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DailyForecastCard } from "./DailyForecastCard";

export function DailyForecastList({ items, timezone, units }: { items: DailyForecast[]; timezone?: string; units: Units }) {
  return (
    <Card className="motion-reveal weather-glass-card min-w-0 overflow-hidden [--reveal-delay:300ms]">
      <CardHeader>
        <CardTitle>Pronóstico diario</CardTitle>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-3">
        {items.slice(0, 7).map((day) => <DailyForecastCard key={day.date} day={day} timezone={timezone} units={units} />)}
      </CardContent>
    </Card>
  );
}
