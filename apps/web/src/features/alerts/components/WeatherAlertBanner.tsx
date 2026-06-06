import { Warning } from "@phosphor-icons/react";
import type { WeatherAlertSummary } from "@weather-app/contracts";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";

export function WeatherAlertBanner({ alerts, onSelect }: { alerts: WeatherAlertSummary[]; onSelect: (alertId: string) => void }) {
  if (alerts.length === 0) return null;
  return (
    <Alert variant="warning" className="motion-reveal overflow-hidden [--reveal-delay:35ms]">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <Warning className="mt-0.5 shrink-0" size={22} />
          <div className="min-w-0">
            <AlertTitle>{alerts.length} alerta{alerts.length > 1 ? "s" : ""} meteorológica{alerts.length > 1 ? "s" : ""}</AlertTitle>
            <AlertDescription>Hay avisos activos para esta ubicación. Revísalos sin alarmismo y toma precauciones razonables.</AlertDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => onSelect(alerts[0]!.id)} className="shrink-0">Ver detalle</Button>
      </div>
    </Alert>
  );
}
