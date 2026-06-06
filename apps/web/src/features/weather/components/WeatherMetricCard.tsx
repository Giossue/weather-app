import type { Icon } from "@phosphor-icons/react";
import { Card, CardContent } from "../../../components/ui/card";

export function WeatherMetricCard({ label, value, helper, icon: IconComponent }: { label: string; value: string; helper?: string; icon?: Icon }) {
  return (
    <Card className="motion-card weather-glass-card h-full shadow-none">
      <CardContent className="flex min-w-0 items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 break-words text-xl font-semibold">{value}</p>
          {helper && <p className="mt-1 truncate text-xs text-muted-foreground">{helper}</p>}
        </div>
        {IconComponent && <IconComponent size={24} className="shrink-0 text-primary" />}
      </CardContent>
    </Card>
  );
}
