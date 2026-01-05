import { Building2, Mail, MapPin } from "lucide-react";
import { useInstitutionRegisterStore } from "../institutionRegister.store";

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function StepConfirm() {
  const { data } = useInstitutionRegisterStore();

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold">Review institution profile</h2>
        <p className="text-muted-foreground">
          Please confirm the information before submitting
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <Item
          icon={Building2}
          label="Institution name"
          value={data.institutionName}
        />
        <Item icon={Mail} label="Email" value={data.email} />
        <Item icon={MapPin} label="City" value={data.city} />
      </div>
    </div>
  );
}
