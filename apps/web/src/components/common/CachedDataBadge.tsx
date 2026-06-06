import { Database } from "@phosphor-icons/react";
import { Badge } from "../ui/badge";

export function CachedDataBadge({ visible }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <Badge variant="secondary" className="gap-1">
      <Database size={14} /> Datos en caché
    </Badge>
  );
}
