import { Card } from "@/components/ui/card";
import type { JSX } from "react";

export function KPIStats({
  items,
}: {
  items: { label: string; value: number; icon: JSX.Element }[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <Card
          key={i}
          className="rounded-2xl p-5 relative overflow-hidden shadow-card bg-surface-elevated"
        >
          <div className="absolute top-2 right-2 p-2 rounded-xl bg-muted/60 dark:bg-muted/40">
            {item.icon}
          </div>
          <p className="text-sm text-muted-foreground tracking-tight">
            {item.label}
          </p>
          <p className="text-4xl font-bold">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
