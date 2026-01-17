
import { type UseFormReturn } from "react-hook-form";
import {
    Camera,
    Building2,
    Mail,
    MapPin,
    Save,
    X,
    Map as MapIcon,
    Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CitySelect } from "@/components/common/CitySelect";
import { cn } from "@/lib/utils";
import type { UpdateInstitutionProfileInput } from "@/features/validation/institutionSchemas";

interface OrganizationFormProps {
    form: UseFormReturn<UpdateInstitutionProfileInput>;
    institution: any;
    onSubmit: (data: UpdateInstitutionProfileInput) => Promise<void>;
    t: (key: string) => string;
}

export function OrganizationForm({ form, institution, onSubmit, t }: OrganizationFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = form;

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="border-border/40 shadow-2xl shadow-primary/5 bg-card/60 backdrop-blur-xl overflow-hidden">
                {/* SECTION: ORGANIZATION DETAILS */}
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-1 bg-primary rounded-full mr-2" />
                        <CardTitle className="text-xl font-bold">
                            {t("INSTITUTION_PROFILE.SECTIONS.ORGANIZATION")}
                        </CardTitle>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-semibold tracking-wide">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        {t("INSTITUTION_PROFILE.BADGES.PUBLIC")}
                    </Badge>
                </CardHeader>

                <CardContent className="p-8 space-y-10">
                    {/* LOGO SECTION */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 group">
                        <div className="relative">
                            <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/10 transition-transform group-hover:scale-105 duration-300">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                                    <Building2 className="h-10 w-10 text-primary/40" />
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="logo-upload"
                                className="absolute bottom-0 right-0 h-9 w-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all border-4 border-background"
                            >
                                <Camera className="h-4 w-4" />
                                <input id="logo-upload" type="file" className="hidden" accept="image/*" />
                            </label>
                        </div>

                        <div className="space-y-3 text-center sm:text-left">
                            <h3 className="font-bold text-lg text-foreground">
                                {t("INSTITUTION_PROFILE.FIELDS.LOGO.LABEL")}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                                {t("INSTITUTION_PROFILE.FIELDS.LOGO.DESCRIPTION")}
                            </p>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                <Button type="button" variant="outline" size="sm" className="font-semibold text-primary border-primary/20 hover:bg-primary/5 transition-colors">
                                    {t("INSTITUTION_PROFILE.FIELDS.LOGO.UPLOAD")}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="font-semibold text-destructive hover:text-destructive hover:bg-destructive/5 transition-colors">
                                    {t("INSTITUTION_PROFILE.FIELDS.LOGO.REMOVE")}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 bg-muted/10 p-6 rounded-2xl border border-border/40 shadow-inner">
                        {/* INSTITUTION NAME */}
                        <div className="space-y-2">
                            <Label htmlFor="institutionName" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                                {t("INSTITUTION_PROFILE.FIELDS.NAME")}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="institutionName"
                                    {...register("institutionName")}
                                    className={cn(
                                        "bg-background/80 border-border/60 focus:border-primary focus:ring-primary/20 h-12 text-base font-medium shadow-sm transition-all rounded-xl",
                                        errors.institutionName && "border-destructive focus:ring-destructive/20"
                                    )}
                                    placeholder="Global Mission Initiative"
                                />
                                {errors.institutionName && (
                                    <p className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1 px-1">
                                        <X className="h-3 w-3" /> {errors.institutionName.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* PRIMARY EMAIL */}
                            <div className="space-y-2">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                                    {t("INSTITUTION_PROFILE.FIELDS.EMAIL")}
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <Input
                                        value={institution?.user?.email || ""}
                                        disabled
                                        className="bg-muted/40 border-border/40 text-muted-foreground h-12 pl-10 rounded-xl cursor-not-allowed opacity-80"
                                    />
                                </div>
                            </div>

                            {/* CITY */}
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                                    {t("INSTITUTION_PROFILE.FIELDS.CITY")}
                                </Label>
                                <CitySelect
                                    value={watch("city") || ""}
                                    onChange={(val) => setValue("city", val, { shouldDirty: true, shouldValidate: true })}
                                    placeholder={t("INSTITUTION_PROFILE.FIELDS.CITY")}
                                />
                                {errors.city && (
                                    <p className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1 px-1">
                                        <X className="h-3 w-3" /> {errors.city.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ADDRESS SECTION */}
                    <div className="space-y-6 pt-2">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">
                            <MapPin className="h-4 w-4" />
                            Location Details
                        </h4>

                        <div className="space-y-3">
                            <Label htmlFor="address" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                                {t("INSTITUTION_PROFILE.FIELDS.ADDRESS")}
                            </Label>
                            <Input
                                id="address"
                                {...register("address")}
                                className="bg-background/80 border-border/60 focus:border-primary h-12 rounded-xl"
                                placeholder="Enter street address"
                            />
                        </div>

                        {/* COORDINATES (OPTIONAL) */}
                        <div className="grid gap-6 md:grid-cols-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapIcon className="h-3.5 w-3.5 text-primary" />
                                    <Label htmlFor="latitude" className="text-xs font-bold uppercase tracking-wider text-primary/80">Latitude</Label>
                                </div>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    {...register("latitude", { valueAsNumber: true })}
                                    className="bg-background/50 border-primary/20 focus:border-primary h-10 rounded-lg text-sm"
                                    placeholder="e.g., 48.8566"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapIcon className="h-3.5 w-3.5 text-primary" />
                                    <Label htmlFor="longitude" className="text-xs font-bold uppercase tracking-wider text-primary/80">Longitude</Label>
                                </div>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    {...register("longitude", { valueAsNumber: true })}
                                    className="bg-background/50 border-primary/20 focus:border-primary h-10 rounded-lg text-sm"
                                    placeholder="e.g., 2.3522"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ACCOUNT SECTION (READ ONLY) */}
                    {institution?.createdAt && (
                        <div className="mt-4 pt-10 border-t border-border/40">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
                                <Building2 className="h-4 w-4" />
                                {t("INSTITUTION_PROFILE.SECTIONS.ACCOUNT")}
                            </h4>
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
                                <div className="h-10 w-10 bg-background rounded-lg flex items-center justify-center shadow-sm">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Member Since</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {new Date(institution.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                {/* FORM FOOTER */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-8 py-6 bg-muted/20 border-t border-border/40">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => reset()}
                        disabled={isSubmitting || !isDirty}
                        className="w-full sm:w-auto font-semibold px-6 hover:bg-muted transition-colors"
                    >
                        {t("INSTITUTION_PROFILE.ACTIONS.CANCEL")}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !isDirty}
                        className="w-full sm:w-auto font-bold px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground min-w-[160px]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                {t("INSTITUTION_PROFILE.ACTIONS.SAVING")}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                {t("INSTITUTION_PROFILE.ACTIONS.SAVE")}
                            </span>
                        )}
                    </Button>
                </div>
            </Card>
        </form>
    );
}
