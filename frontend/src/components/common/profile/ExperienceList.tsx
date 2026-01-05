import { format } from "date-fns";

interface Experience {
    jobTitle: string;
    organization: string;
    startDate: Date;
    endDate?: Date | null;
    description?: string | null;
}

interface ExperienceListProps {
    experiences: Experience[];
}

export function ExperienceList({ experiences }: ExperienceListProps) {
    if (experiences.length === 0) {
        return <p className="text-sm text-muted-foreground">No experience added</p>;
    }

    const formatDate = (date: Date) => {
        return format(new Date(date), "MMM yyyy");
    };

    return (
        <div className="space-y-4">
            {experiences.map((exp, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                    <h4 className="font-medium">{exp.jobTitle}</h4>
                    <p className="text-sm text-muted-foreground">{exp.organization}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                    </p>
                    {exp.description && (
                        <p className="text-sm mt-2">{exp.description}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
