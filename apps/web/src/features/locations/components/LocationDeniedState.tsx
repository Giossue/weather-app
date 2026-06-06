import { MapPin } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";

export function LocationDeniedState({ message }: { message: string }) {
  return (
    <Alert className="bg-muted/70">
      <div className="flex gap-3">
        <MapPin className="mt-0.5 text-primary" size={22} />
        <div>
          <AlertTitle>Ubicación no disponible</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
