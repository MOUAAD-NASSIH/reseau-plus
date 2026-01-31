import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Mail,
    Loader2,
    Calendar,
    Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ProfilePictureUpload } from "@/components/common/ProfilePictureUpload";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";
import {
    useUploadAdminProfilePictureMutation,
    useDeleteAdminProfilePictureMutation
} from "@/features/api/endpoints/adminEndpoints";
import { useUpdateProfilePictureMutation } from "@/features/api/endpoints/authEndpoints";
import {
    updateAdminProfileSchema,
    type UpdateAdminProfileInput,
} from "@/features/validation/adminSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function AdminProfile() {
    const { t, i18n } = useTranslation();

    // API Hooks
    const { data: userData, isLoading: profileLoading } = useGetCurrentUserQuery();
    const [uploadProfilePicture, { isLoading: isUploadingPicture }] = useUploadAdminProfilePictureMutation();
    const [deleteProfilePicture, { isLoading: isDeletingPicture }] = useDeleteAdminProfilePictureMutation();
    const [updateProfilePictureCache] = useUpdateProfilePictureMutation();

    const user = userData?.data?.user;

    // Form Setup
    const {
        register,
        reset,
        formState: { errors },
    } = useForm<UpdateAdminProfileInput>({
        resolver: zodResolver(updateAdminProfileSchema),
        defaultValues: {
            email: "",
        },
    });

    // Populate form when user data loads
    useEffect(() => {
        if (user && "email" in user) {
            reset({
                email: user.email || "",
            });
        }
    }, [user, reset]);

    const handleProfilePictureUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("profilePicture", file);
        try {
            const result = await uploadProfilePicture(formData).unwrap();
            // Update RTK Query cache immediately for instant UI feedback
            if (result.data?.url) {
                await updateProfilePictureCache(result.data.url);
            }
            showSuccessToast(
                t("ADMIN_PROFILE.ACTIONS.MESSAGES.PIC_UPLOAD_SUCCESS"),
                t("ADMIN_PROFILE.ACTIONS.MESSAGES.PIC_UPLOAD_DESC")
            );
        } catch (error) {
            showErrorToast(error, t("ADMIN_PROFILE.ACTIONS.MESSAGES.UPLOAD_ERROR"));
        }
    };

    const handleProfilePictureDelete = async () => {
        try {
            await deleteProfilePicture().unwrap();
            // Update RTK Query cache immediately
            await updateProfilePictureCache(null);
            showSuccessToast(
                t("ADMIN_PROFILE.ACTIONS.MESSAGES.PIC_DELETE_SUCCESS"),
                t("ADMIN_PROFILE.ACTIONS.MESSAGES.PIC_DELETE_DESC")
            );
        } catch (error) {
            showErrorToast(error, t("ADMIN_PROFILE.ACTIONS.MESSAGES.DELETE_ERROR"));
        }
    };

    // Calculate profile completion
    const calculateCompletion = () => {
        let completed = 0;
        const total = 2; // Email + Profile Picture

        if (user && "email" in user && user.email) completed++;
        if (user && "profilePicture" in user && user.profilePicture) completed++;

        return Math.round((completed / total) * 100);
    };

    const profileCompletion = calculateCompletion();

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-indigo-500/30">
            {/* Top Navbar */}
            <div className="z-10 bg-background/80 backdrop-blur-md border-b border-border/50 py-4 sm:p-4 lg:p-8 supports-backdrop-filter:bg-background/60">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Header Content */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl font-bold font-spline tracking-tight">
                            {t("ADMIN_PROFILE.TITLE")}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t("ADMIN_PROFILE.SUBTITLE")}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto py-4 sm:p-4 lg:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Sidebar (Profile, Account Info) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* 1. Main Profile Card */}
                        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden rounded-2xl">
                            <div className="p-8 flex flex-col items-center text-center">
                                {/* Avatar Section */}
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                                    <ProfilePictureUpload
                                        currentImage={user && "profilePicture" in user ? user.profilePicture : null}
                                        name={user && "email" in user ? user.email : "Admin"}
                                        onUpload={handleProfilePictureUpload}
                                        onDelete={handleProfilePictureDelete}
                                        isLoading={isUploadingPicture}
                                        isDeleting={isDeletingPicture}
                                        size="3xl"
                                        className="relative"
                                    />
                                </div>

                                {/* Name & Role */}
                                <h2 className="text-xl font-bold font-spline mt-4 text-foreground flex items-center justify-center gap-2">
                                    {user && "email" in user ? user.email.split("@")[0] : "Administrator"}
                                    <div className="bg-indigo-500 text-white text-[10px] font-bold px-0.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm" title="Admin">
                                        <Shield className="size-3 fill-current" />
                                        <span className="sr-only">Admin</span>
                                    </div>
                                </h2>
                                <p className="text-muted-foreground font-medium font-spline text-sm mt-1">
                                    {t("ADMIN_PROFILE.BADGES.ADMIN")}
                                </p>

                                {/* Completion Bar */}
                                <div className="w-full mt-6 space-y-2">
                                    <div className="flex justify-between items-center text-xs font-medium font-spline uppercase tracking-wider">
                                        <span className="text-muted-foreground">
                                            {t("ADMIN_PROFILE.CARDS.PROFILE.STRENGTH")}
                                        </span>
                                        <span className={profileCompletion === 100 ? "text-green-500" : "text-foreground"}>
                                            {profileCompletion}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={profileCompletion}
                                        className="h-2.5 bg-muted/50"
                                        indicatorClassName={profileCompletion === 100 ? "bg-green-500" : "bg-indigo-500"}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* 2. Account Info Card */}
                        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl p-5 space-y-4">
                            <h4 className="font-semibold flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-indigo-500" />
                                {t("ADMIN_PROFILE.SECTIONS.ACCOUNT_INFO")}
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="h-8 w-8 bg-background rounded-md flex items-center justify-center shadow-xs">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                            {t("ADMIN_PROFILE.FIELDS.MEMBER_SINCE")}
                                        </p>
                                        <p className="text-xs font-semibold text-foreground">
                                            {user && "createdAt" in user && user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString(i18n.language, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                    </div>

                    {/* Right Column: Account Information */}
                    <div className="lg:col-span-8 flex flex-col gap-8">

                        {/* Account Information */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold font-spline text-foreground">
                                    {t("ADMIN_PROFILE.SECTIONS.ACCOUNT_INFO")}
                                </h3>
                            </div>
                            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden p-6">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Email (Read only) */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                                            {t("ADMIN_PROFILE.FIELDS.EMAIL")}
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...register("email")}
                                                disabled
                                                className="pl-9 bg-muted/20 border-transparent text-muted-foreground h-11"
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                    </div>

                                    {/* Role (Read only) */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                                            {t("ADMIN_PROFILE.FIELDS.ROLE")}
                                        </Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={t("ADMIN_PROFILE.BADGES.ADMIN")}
                                                disabled
                                                className="pl-9 bg-muted/20 border-transparent text-muted-foreground h-11"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Settings Note */}
                        <section className="space-y-4">
                            <Card className="border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden p-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <Shield className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm text-foreground mb-1">
                                            {t("ADMIN_PROFILE.SECTIONS.SETTINGS")}
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {t("ADMIN_PROFILE.SETTINGS_DESC")}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </section>

                    </div>
                </div>
                <div className="h-4"></div>
            </div>
        </div>
    );
}
