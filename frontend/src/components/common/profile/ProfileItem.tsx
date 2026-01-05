interface ProfileItemProps {
    label: string;
    value?: string | number | null;
}

export function ProfileItem({ label, value }: ProfileItemProps) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value ?? "-"}</p>
        </div>
    );
}
