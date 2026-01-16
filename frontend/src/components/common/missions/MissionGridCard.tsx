import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import {
  Building2,
  Calendar,
  MapPin,
  Eye,
  Users,
  Edit,
  Trash2,
  Check,
} from "lucide-react";
import type { Urgency } from "@/types";

/**
 * Local unified badge styling – no global changes
 */
const base =
  "rounded-md px-2.5 py-0.5 text-xs font-medium border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5";

export const urgencyColors: Record<Urgency, string> = {
  HIGH: `${base} bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20`,
  MEDIUM: `${base} bg-warning/15 text-warning border-warning/30 hover:bg-warning/20`,
  LOW: `${base} bg-primary/15 text-primary border-primary/30 hover:bg-primary/20`,
};

type Mode = "admin" | "worker" | "institution";

export function MissionGridCard({
  m,
  applied = false,
  status,
  mode = "worker",
  onView,
  onApplicants,
  onEdit,
  onDelete,
}: {
  m: any;
  applied?: boolean;
  status?: React.ReactNode;
  mode?: Mode;
  onView?: () => void;
  onApplicants?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card className="rounded-2xl border bg-white p-5 card-hover space-y-4 hover:shadow-md transition hover:bg-muted/20">
      {/* Header Badges */}
      <div className="flex items-center justify-between">
        {status}

        <div className="flex gap-2 items-center">
          {/* Urgency */}
          <Badge className={urgencyColors[m.urgency as Urgency]}>
            {m.urgency}
          </Badge>

          {/* Applied */}
          {applied && (
            <Badge
              className="
                rounded-md px-2.5 py-0.5 text-xs font-medium 
                border shadow-sm transition-all duration-200
                hover:shadow-md hover:-translate-y-0.5
                bg-success/15 text-success border-success/30 hover:bg-success/20
              "
            >
              <div className="flex items-center gap-1.5">
                <Check width={14} className="stroke-current" />
                Applied
              </div>
            </Badge>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold truncate">{m.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {m.description}
      </p>

      {/* Info */}
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 truncate">
          <Building2 className="h-4 w-4" />
          {m.institution?.institutionName ?? "-"}
        </div>

        {m.location && (
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4" />
            {m.location}
          </div>
        )}

        <div className="flex items-center gap-2 truncate">
          <Calendar className="h-4 w-4" />
          {new Date(m.startDate).toLocaleDateString()} →{" "}
          {new Date(m.endDate).toLocaleDateString()}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 border-t pt-4">
        {mode === "worker" && (
          <Button asChild size="sm" variant="outline">
            <Link to={`/worker/missions/${m.id}`}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Link>
          </Button>
        )}

        {mode === "admin" && (
          <Button size="sm" variant="outline" onClick={onView}>
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
        )}

        {mode === "institution" && (
          <>
            <Button size="sm" variant="ghost" asChild>
              <Link to={`/institution/missions/${m.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>

            <Button size="sm" variant="ghost" asChild>
              <Link to={`/institution/missions/${m.id}/applicants`}>
                <Users className="h-4 w-4" />
              </Link>
            </Button>

            <Button size="sm" variant="ghost" asChild>
              <Link to={`/institution/missions/${m.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
