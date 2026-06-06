import { WifiSlash } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function OfflineBanner({ online }: { online: boolean }) {
  if (online) return null;
  return (
    <Alert className="border-primary/30 bg-primary/10">
      <div className="flex gap-3">
        <WifiSlash className="mt-0.5" size={20} />
        <div>
          <AlertTitle>Modo sin conexión</AlertTitle>
          <AlertDescription>Se mostrará el último clima guardado cuando esté disponible. Los datos podrían no estar actualizados.</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
