import { Crosshair } from "@phosphor-icons/react";
import { Button } from "../../../components/ui/button";

export function CurrentLocationButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <Button onClick={onClick} disabled={loading}>
      <Crosshair size={18} className={loading ? "animate-spin" : ""} /> Usar mi ubicación
    </Button>
  );
}
