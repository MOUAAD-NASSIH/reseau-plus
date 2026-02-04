import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, List, LayoutGrid } from "lucide-react";

interface MissionFiltersProps {
  filters: any;
  setFilters: (cb: (prev: any) => any) => void;
  resetFilters: () => void;
  specialities: any[];
  domains?: any[];
  showDomains?: boolean;
  showStatus?: boolean;
  statusOptions?: Array<{ value: string; label: string }>;
  view: "grid" | "table";
  setView: (v: "grid" | "table") => void;
}

export function MissionFilters({
  filters,
  setFilters,
  resetFilters,
  specialities,
  domains = [],
  showDomains = false,
  showStatus = false,
  statusOptions = [],
  view,
  setView,
}: MissionFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.speciality !== "ALL" ||
    (showDomains && filters.domain !== "ALL") ||
    (showStatus && filters.status !== "ALL") ||
    filters.urgency !== "ALL";

  return (
    <Card className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="grid md:flex items-center gap-3">
        {/* Search */}
        <Input
          placeholder="Search..."
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
        />

        {/* Speciality */}
        <Select
          value={filters.speciality}
          onValueChange={(v) => setFilters((f) => ({ ...f, speciality: v }))}
        >
          <SelectTrigger className="input-focus">
            <SelectValue placeholder="Speciality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Specialities</SelectItem>
            {specialities.map((s) => (
              <SelectItem key={s.id} value={`${s.id}`}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Domain (worker only) */}
        {showDomains && (
          <Select
            value={filters.domain}
            onValueChange={(v) => setFilters((f) => ({ ...f, domain: v }))}
          >
            <SelectTrigger className="input-focus">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Domains</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d.id} value={`${d.id}`}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status (admin only) */}
        {showStatus && (
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          >
            <SelectTrigger className="input-focus">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Urgency always */}
        <Select
          value={filters.urgency}
          onValueChange={(v) => setFilters((f) => ({ ...f, urgency: v }))}
        >
          <SelectTrigger className="input-focus">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Urgencies</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* RESET — only when needed */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}

        {/* GRID ↔ TABLE switch */}
        <Button
          variant="outline"
          onClick={() => setView(view === "grid" ? "table" : "grid")}
        >
          {view === "grid" ? (
            <>
              <List className="h-4 w-4 mr-1" /> Table
            </>
          ) : (
            <>
              <LayoutGrid className="h-4 w-4 mr-1" /> Grid
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
