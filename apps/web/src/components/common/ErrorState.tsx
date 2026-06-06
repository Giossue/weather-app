import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function ErrorState({ title = "No se pudo cargar", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div className="flex items-center gap-3 text-destructive">
          <WarningCircle size={26} />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="max-w-[60ch] text-sm text-muted-foreground">{message}</p>
        {onRetry && <Button onClick={onRetry}>Intentar de nuevo</Button>}
      </CardContent>
    </Card>
  );
}
