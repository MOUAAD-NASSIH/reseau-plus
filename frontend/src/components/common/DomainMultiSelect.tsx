import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDomains } from "@/features/hooks/useDomains";

interface DomainMultiSelectProps {
    value: number[];
    onChange: (value: number[]) => void;
}

export function DomainMultiSelect({ value, onChange }: DomainMultiSelectProps) {
    const { data: domainsData, isLoading } = useDomains();
    const domains = domainsData?.data || [];

    const handleToggle = (domainId: number) => {
        const updated = value.includes(domainId)
            ? value.filter((id) => id !== domainId)
            : [...value, domainId];
        onChange(updated);
    };

    if (isLoading) {
        return (
            <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-6 w-24" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 pt-2">
            {domains.map((domain) => (
                <div key={domain.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={`domain-${domain.id}`}
                        checked={value.includes(domain.id)}
                        onCheckedChange={() => handleToggle(domain.id)}
                    />
                    <Label
                        htmlFor={`domain-${domain.id}`}
                        className="text-sm font-normal cursor-pointer"
                    >
                        {domain.name}
                    </Label>
                </div>
            ))}
        </div>
    );
}
