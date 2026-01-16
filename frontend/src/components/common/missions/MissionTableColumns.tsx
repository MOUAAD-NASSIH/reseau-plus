import type { ColumnDef } from "@tanstack/react-table";
import type { Mission } from "@/types/mission.types";
import { Badge } from "@/components/ui/badge";
import { urgencyColors } from "./constants";

export function baseMissionColumns<T extends Mission>(): ColumnDef<T>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "urgency",
      header: "Urgency",
      cell: ({ row }) => (
        <Badge className={urgencyColors[row.original.urgency]}>
          {row.original.urgency}
        </Badge>
      ),
    },
  ];
}
