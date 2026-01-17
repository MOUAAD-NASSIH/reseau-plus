import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/StatusBadge";

import {
  Briefcase,
  Calendar,
  MapPin,
  Building2,
  AlertTriangle,
  Layers,
} from "lucide-react";

import type { Mission } from "@/types/mission.types";
import { urgencyColors } from "./constants";

export function MissionDetailsDialog({
  mission,
  open,
  onOpenChange,
  mode,
}: {
  mission: Mission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: string;
}) {
  if (!mission) return null;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("fr-MA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const mad = (m?: number | null) =>
    m == null
      ? "Not specified"
      : new Intl.NumberFormat("fr-MA", {
          style: "currency",
          currency: "MAD",
        }).format(m);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-2xl max-h-[85vh] overflow-y-auto
          rounded-2xl shadow-xl border border-border/50
          bg-card backdrop-blur-sm
          p-0
        "
      >
        {/* HEADER */}
        <div className="p-5 border-b border-border/40 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <span className="inline-flex items-center justify-center h-4 w-4 text-primary">
                <Briefcase className="h-4 w-4" />
              </span>
              {mission.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Mission overview & key requirements
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 flex gap-2 items-center">
            <StatusBadge status={mission.status} />
            <Badge
              className={`flex items-center gap-1 ${
                urgencyColors[mission.urgency]
              } text-xs px-2 py-0.5`}
            >
              <span className="inline-flex items-center justify-center h-3 w-3">
                <AlertTriangle className="h-3 w-3" />
              </span>
              {mission.urgency}
            </Badge>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-6">
          {/* INFO GRID */}
          <section>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
              Key Information
            </h4>
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border/30 bg-muted/30">
              <Info
                icon={<Building2 className="h-3 w-3" />}
                label="Institution"
              >
                {mission.institution?.institutionName ?? "Unknown"}
              </Info>
              <Info icon={<MapPin className="h-3 w-3" />} label="Location">
                {mission.location ?? "Not specified"}
              </Info>
              <Info icon={<Calendar className="h-3 w-3" />} label="Dates">
                {fmt(mission.startDate)} → {fmt(mission.endDate)}
              </Info>
              <Info icon={<Layers className="h-3 w-3" />} label="Budget">
                {mad(mission.budget)}
              </Info>
              {mission.speciality && (
                <Info label="Speciality">
                  <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                    {mission.speciality.name}
                  </Badge>
                </Info>
              )}
            </div>
          </section>

          {/* DESCRIPTION */}
          {mission.description && (
            <section>
              <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                Description
              </h4>
              <p className="p-4 rounded-lg bg-muted/30 border border-border/30 text-sm leading-relaxed">
                {mission.description}
              </p>
            </section>
          )}

          {/* DOMAINS */}
          {mission.domains?.length ? (
            <section>
              <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                Domains
              </h4>
              <div className="flex flex-wrap gap-2">
                {mission.domains.map((d) => (
                  <Badge
                    key={d.id}
                    variant={d.isRequired ? "default" : "outline"}
                    className="rounded-full px-3 py-0.5 text-xs"
                  >
                    {d.domain?.name ?? "Unknown"}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <Label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {icon && (
          <span className="inline-flex items-center justify-center h-3 w-3">
            {icon}
          </span>
        )}
        {label}
      </Label>
      <p className="font-medium text-sm truncate">{children}</p>
    </div>
  );
}
