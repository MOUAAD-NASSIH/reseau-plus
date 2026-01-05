import { Badge } from "@/components/ui/badge";

interface DomainListProps {
    domainNames: string[];
}

export function DomainList({ domainNames }: DomainListProps) {
    if (domainNames.length === 0) {
        return <p className="text-sm text-muted-foreground">No domains selected</p>;
    }

    return (
        <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Domains</p>
            <div className="flex flex-wrap gap-2">
                {domainNames.map((name, index) => (
                    <Badge key={index} variant="secondary">
                        {name}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
