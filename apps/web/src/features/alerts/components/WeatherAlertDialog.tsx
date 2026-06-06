import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { getWeatherAlert } from "../../../services/weather.service";
import { formatShortDateTime } from "../../../lib/formatters";

const cleanDescription = (value?: string) => {
  const text = value?.trim();
  if (!text || text === "[object Object]") return "La alerta no incluye una descripción legible.";
  return text;
};

export function WeatherAlertDialog({ alertId, open, onOpenChange }: { alertId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const query = useQuery({
    queryKey: ["weather-alert", alertId],
    queryFn: () => getWeatherAlert(alertId!),
    enabled: open && Boolean(alertId)
  });

  const alert = query.data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{alert?.event ?? "Detalle de alerta"}</DialogTitle>
          <DialogDescription>{alert?.source ?? "Fuente no especificada"}</DialogDescription>
        </DialogHeader>
        {query.isLoading && <p className="text-sm text-muted-foreground">Cargando detalle...</p>}
        {query.error && <p className="text-sm text-destructive">No se pudo cargar el detalle de esta alerta.</p>}
        {alert && (
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">Inicio:</span> {formatShortDateTime(alert.startsAt)}</p>
            <p><span className="font-medium">Fin:</span> {formatShortDateTime(alert.endsAt)}</p>
            <div className="max-h-72 overflow-y-auto rounded-xl bg-muted/50 p-3 leading-relaxed text-muted-foreground whitespace-pre-line">
              {cleanDescription(alert.description)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
