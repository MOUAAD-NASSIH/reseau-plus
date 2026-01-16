
interface ProfileHeaderProps {
    t: (key: string) => string;
}

export function ProfileHeader({ t }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("INSTITUTION_PROFILE.TITLE")}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t("INSTITUTION_PROFILE.SUBTITLE")}
                </p>
            </div>
        </div>
    );
}
