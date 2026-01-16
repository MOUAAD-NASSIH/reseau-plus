
interface AdminProfileHeaderProps {
    t: (key: string) => string;
}

export function AdminProfileHeader({ t }: AdminProfileHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {t("ADMIN_PROFILE.TITLE")}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t("ADMIN_PROFILE.SUBTITLE")}
                </p>
            </div>
        </div>
    );
}
