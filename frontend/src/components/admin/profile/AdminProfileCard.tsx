
import {
    User,
    Mail,
    Shield,
    Calendar,
    Settings,
    Activity,
    Users,
    Building2,
    FileText,
    Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminProfileCardProps {
    stats: any;
    t: (key: string) => string;
    formatDate: (date?: string) => string;
    getRoleName: () => string;
    getEmail: () => string;
    getCreatedAt: () => string | undefined;
}

export function AdminProfileCard({
    stats,
    t,
    formatDate,
    getRoleName,
    getEmail,
    getCreatedAt,
}: AdminProfileCardProps) {
    return (
        <div className="grid gap-8">
            <Card className="border-border/40 shadow-2xl shadow-primary/5 bg-card/60 backdrop-blur-xl overflow-hidden rounded-4xl">
                {/* SECTION: ACCOUNT INFO */}
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-1 bg-primary rounded-full mr-2" />
                        <CardTitle className="text-xl font-bold">
                            {t("ADMIN_PROFILE.SECTIONS.ACCOUNT_INFO")}
                        </CardTitle>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-semibold tracking-wide">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        {t("ADMIN_PROFILE.BADGES.ACTIVE")}
                    </Badge>
                </CardHeader>

                <CardContent className="p-8 space-y-10">
                    {/* AVATAR SECTION */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 group">
                        <div className="relative">
                            <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/10 transition-transform group-hover:scale-105 duration-300">
                                <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                                    <User className="h-10 w-10 text-primary/40" />
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="space-y-2 text-center sm:text-left">
                            <h3 className="font-black text-2xl tracking-tight text-foreground uppercase">
                                {getEmail().split('@')[0]}
                            </h3>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                <Badge variant="outline" className="font-black tracking-widest text-[10px] uppercase py-1 px-3 bg-primary/10 text-primary border-primary/20">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {getRoleName()}
                                </Badge>
                                <Badge variant="outline" className="font-black tracking-widest text-[10px] uppercase py-1 px-3 bg-muted/30 text-muted-foreground border-border/40">
                                    {t("ADMIN_PROFILE.BADGES.ADMIN")}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 bg-muted/10 p-6 rounded-3xl border border-border/40 shadow-inner">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* EMAIL */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                    {t("ADMIN_PROFILE.FIELDS.EMAIL")}
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Mail className="h-4 w-4 text-primary opacity-40" />
                                    </div>
                                    <div className="h-12 w-full bg-background/50 border border-border/40 rounded-xl flex items-center pl-11 font-bold text-sm">
                                        {getEmail()}
                                    </div>
                                </div>
                            </div>

                            {/* MEMBER SINCE */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                    {t("ADMIN_PROFILE.FIELDS.MEMBER_SINCE")}
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Calendar className="h-4 w-4 text-purple-500 opacity-40" />
                                    </div>
                                    <div className="h-12 w-full bg-background/50 border border-border/40 rounded-xl flex items-center pl-11 font-bold text-sm">
                                        {formatDate(getCreatedAt())}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PLATFORM OVERVIEW */}
                    <div className="space-y-6 pt-2">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 opacity-70">
                            <Activity className="h-4 w-4" />
                            {t("ADMIN_PROFILE.SECTIONS.PLATFORM_OVERVIEW")}
                        </h4>

                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2 group hover:bg-primary/10 transition-colors duration-300">
                                <Users className="h-5 w-5 text-primary opacity-50 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{t("ADMIN_PROFILE.STATS.TOTAL_WORKERS")}</p>
                                    <p className="text-2xl font-black">{stats?.totalWorkers || 0}</p>
                                    <p className="text-[9px] font-bold text-primary/60">{stats?.pendingWorkers || 0} {t("ADMIN_PROFILE.STATS.PENDING_WORKERS")}</p>
                                </div>
                            </div>
                            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2 group hover:bg-amber-500/10 transition-colors duration-300">
                                <Building2 className="h-5 w-5 text-amber-500 opacity-50 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{t("ADMIN_PROFILE.STATS.TOTAL_INSTITUTIONS")}</p>
                                    <p className="text-2xl font-black">{stats?.totalInstitutions || 0}</p>
                                </div>
                            </div>
                            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2 group hover:bg-blue-500/10 transition-colors duration-300">
                                <FileText className="h-5 w-5 text-blue-500 opacity-50 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{t("ADMIN_PROFILE.STATS.TOTAL_MISSIONS")}</p>
                                    <p className="text-2xl font-black">{stats?.totalMissions || 0}</p>
                                    <p className="text-[9px] font-bold text-blue-500/60">{stats?.activeMissions || 0} {t("ADMIN_PROFILE.STATS.ACTIVE_MISSIONS")}</p>
                                </div>
                            </div>
                            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2 group hover:bg-emerald-500/10 transition-colors duration-300">
                                <Wallet className="h-5 w-5 text-emerald-500 opacity-50 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{t("ADMIN_PROFILE.STATS.TOTAL_PAYMENTS")}</p>
                                    <p className="text-2xl font-black">{stats?.totalPayments || 0}</p>
                                    <p className="text-[9px] font-bold text-emerald-500/60">{stats?.pendingPayments || 0} {t("ADMIN_PROFILE.STATS.PENDING_PAYMENTS")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SETTINGS SECTION */}
                    <div className="mt-4 pt-10 border-t border-border/40">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 opacity-70">
                            <Settings className="h-4 w-4" />
                            {t("ADMIN_PROFILE.SECTIONS.SETTINGS")}
                        </h4>
                        <div className="bg-muted/30 p-6 rounded-3xl border border-border/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                            <p className="text-sm font-semibold leading-relaxed text-foreground/70 relative z-10">
                                {t("ADMIN_PROFILE.SETTINGS_DESC")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
