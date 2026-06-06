import { MagnifyingGlass } from "@phosphor-icons/react";
import { Card, CardContent } from "../ui/card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="rounded-full bg-secondary p-3 text-primary">
          <MagnifyingGlass size={28} />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
