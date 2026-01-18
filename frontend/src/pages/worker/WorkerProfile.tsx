import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import {
    Save,
    Verified,
    Shield,
    Mail,
    Loader2,
    Calendar,
    User,
    GraduationCap,
    Clock,
    Plus,
    X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    useGetWorkerProfileQuery,
    useUpdateWorkerProfileMutation,
    useUploadProfilePictureMutation,
    useDeleteProfilePictureMutation,
    useGetWorkerDocumentsQuery,
} from "@/features/api/endpoints/workerEndpoints";
import { useGetSpecialitiesQuery, useGetDomainsQuery } from "@/features/api/endpoints/domainEndpoints";
import { useUpdateProfilePictureMutation } from "@/features/api/endpoints/authEndpoints";
import { ProfilePictureUpload } from "@/components/common/ProfilePictureUpload";
import { CitySelect } from "@/components/common/CitySelect";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { DomainMultiSelect } from "@/components/common/DomainMultiSelect";
import {
    updateWorkerProfileSchema,
    type UpdateWorkerProfileInput,
} from "@/features/validation/workerSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function WorkerProfile() {
    // API Hooks
    const { data: profileData, isLoading: profileLoading } = useGetWorkerProfileQuery();
    const { data: documentsData } = useGetWorkerDocumentsQuery();
    const { data: specialitiesData } = useGetSpecialitiesQuery();
    const { data: domainsData } = useGetDomainsQuery();

    const [updateProfile, { isLoading: isUpdating }] = useUpdateWorkerProfileMutation();
    const [uploadProfilePicture, { isLoading: isUploadingPicture }] = useUploadProfilePictureMutation();
    const [deleteProfilePicture, { isLoading: isDeletingPicture }] = useDeleteProfilePictureMutation();
    const [updateProfilePictureCache] = useUpdateProfilePictureMutation();

    const worker = profileData?.data;
    const documents = documentsData?.data || [];
    const specialities = specialitiesData?.data || [];

    // Local State
    const [selectedDomains, setSelectedDomains] = useState<number[]>([]);

    // Form Setup
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = useForm<UpdateWorkerProfileInput>({
        resolver: zodResolver(updateWorkerProfileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            specialityId: null,
            experienceYears: null,
            bio: null,
            city: null,
            zipCode: null,
            birthDate: null,
            gender: null,
            domainIds: [],
        },
    });

    const watchedBio = watch("bio") || "";
    const watchedFirstName = watch("firstName");
    const watchedLastName = watch("lastName");

    // Populate form when worker data loads
    useEffect(() => {
        if (worker) {
            reset({
                firstName: worker.firstName || "",
                lastName: worker.lastName || "",
                specialityId: worker.specialityId || null,
                experienceYears: worker.experienceYears || null,
                bio: worker.bio || null,
                city: worker.city || null,
                zipCode: worker.zipCode || null,
                birthDate: worker.birthDate ? worker.birthDate.split("T")[0] : null,
                gender: worker.gender || null,
                domainIds: worker.domains?.map(d => d.domainId) || [],
            });
            setSelectedDomains(worker.domains?.map(d => d.domainId) || []);
        }
    }, [worker, reset]);

    // Handle domain changes separately to sync with local state
    const handleDomainChange = (ids: number[]) => {
        setSelectedDomains(ids);
        setValue("domainIds", ids, { shouldDirty: true });
    };

    const onSubmit = async (data: UpdateWorkerProfileInput) => {
        try {
            await updateProfile({
                ...data,
                domainIds: selectedDomains // Explicitly pass selected domains
            }).unwrap();
            showSuccessToast("Profile updated", "Your profile has been saved successfully.");
        } catch (error) {
            showErrorToast(error, "Failed to update profile");
        }
    };

    const handleProfilePictureUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("profilePicture", file);
        try {
            const result = await uploadProfilePicture(formData).unwrap();
            // Update RTK Query cache immediately for instant UI feedback
            if (result.data?.url) {
                await updateProfilePictureCache(result.data.url);
            }
            showSuccessToast("Profile picture updated", "Your profile picture has been uploaded successfully.");
        } catch (error) {
            showErrorToast(error, "Failed to upload profile picture");
        }
    };

    const handleProfilePictureDelete = async () => {
        try {
            await deleteProfilePicture().unwrap();
            // Update RTK Query cache immediately
            await updateProfilePictureCache(null);
            showSuccessToast("Profile picture removed", "Your profile picture has been deleted.");
        } catch (error) {
            showErrorToast(error, "Failed to delete profile picture");
        }
    };

    const handleCancel = () => {
        reset();
        if (worker?.domains) {
            setSelectedDomains(worker.domains.map(d => d.domainId));
        }
    };

    // Calculate profile completion
    const calculateCompletion = () => {
        let completed = 0;
        const total = 9;

        if (worker?.firstName && worker?.lastName) completed++;
        if (worker?.user?.email) completed++;
        if (worker?.city) completed++;
        if (worker?.specialityId) completed++;
        if (worker?.experienceYears) completed++;
        if (worker?.bio) completed++;
        if (worker?.domains && worker.domains.length > 0) completed++;

        // Document checks
        const hasDiploma = documents.some(d => d.type === 'DIPLOMA' && d.status !== 'REJECTED');
        const hasID = documents.some(d => d.type === 'ID' && d.status !== 'REJECTED');

        if (hasDiploma) completed++;
        if (hasID) completed++;

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
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-green-500/30">
            {/* Top Navbar */}
            <div className="z-10 bg-background/80 backdrop-blur-md border-b border-border/50 py-4 sm:p-4 lg:p-8 supports-backdrop-filter:bg-background/60">
                <div className="max-w-7xl mx-auto flex justify-between items-center">


                    {/* Desktop Header Content */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl font-bold font-spline tracking-tight">My Profile</h1>
                        <p className="text-sm text-muted-foreground">Manage your personal information and privacy.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto py-4 sm:p-4 lg:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Sidebar (Profile, Availability, Docs) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* 1. Main Profile Card */}
                        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden rounded-2xl">
                            <div className="p-8 flex flex-col items-center text-center">
                                {/* Avatar Section */}
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                                    <ProfilePictureUpload
                                        currentImage={worker?.user?.profilePicture ?? worker?.profilePicture}
                                        name={`${worker?.firstName || ''} ${worker?.lastName || ''}`}
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
                                    {watchedFirstName || worker?.firstName} {watchedLastName || worker?.lastName}
                                    {worker?.status === "VERIFIED" && (
                                        <div className="bg-green-500 text-white text-[10px] font-bold px-0.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm" title="Verified Worker">
                                            <Verified className="size-3 fill-current" />
                                            <span className="sr-only">Verified</span>
                                        </div>
                                    )}
                                </h2>
                                <p className="text-muted-foreground font-medium font-spline text-sm mt-1">
                                    {worker?.speciality?.name || "Social Worker"}
                                </p>

                                {/* Completion Bar */}
                                <div className="w-full mt-6 space-y-2">
                                    <div className="flex justify-between items-center text-xs font-medium font-spline uppercase tracking-wider">
                                        <span className="text-muted-foreground">Profile Strength</span>
                                        <span className={profileCompletion === 100 ? "text-green-500" : "text-foreground"}>
                                            {profileCompletion}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={profileCompletion}
                                        className="h-2.5 bg-muted/50"
                                        indicatorClassName={profileCompletion === 100 ? "bg-green-500" : "bg-primary"}
                                    />
                                    {profileCompletion < 100 && (
                                        <p className="text-[10px] text-muted-foreground text-left">
                                            Complete your profile to increase visibility.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* 2. Availability Card */}
                        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden group hover:border-green-500/30 transition-colors">
                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Availability</span>
                                        <span className="text-xs text-muted-foreground">Manage your schedule</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-500/5">
                                        Active
                                    </Badge>
                                    <Link to="/worker/availability">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                            <Clock className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="px-5 pb-5 pt-0">
                                <Link to="/worker/availability" className="block w-full">
                                    <Button variant="outline" size="sm" className="w-full justify-between group-hover:bg-muted/50">
                                        Manage Availability
                                        <span className="text-xs text-muted-foreground">→</span>
                                    </Button>
                                </Link>
                            </div>
                        </Card>

                        {/* 3. Verifications Card */}
                        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold flex items-center gap-2 text-sm">
                                    <Shield className="h-4 w-4 text-primary" />
                                    Verifications
                                </h4>
                                <Link to="/worker/documents">
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-green-500">View All</Button>
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {/* Diploma Status */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <GraduationCap className="h-3.5 w-3.5" /> Diploma
                                    </span>
                                    {documents.some(d => d.type === 'DIPLOMA' && d.status === 'APPROVED') ? (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 text-[10px] h-5">Verified</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] h-5">Pending</Badge>
                                    )}
                                </div>
                                {/* Identity Status */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" /> Identity
                                    </span>
                                    {documents.some(d => d.type === 'ID' && d.status === 'APPROVED') ? (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 text-[10px] h-5">Verified</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] h-5">Pending</Badge>
                                    )}
                                </div>
                            </div>
                        </Card>

                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-8 flex flex-col gap-8">

                        {/* Personal Information */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold font-spline text-foreground">Personal Information</h3>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500" onClick={() => document.getElementById('firstName')?.focus()}>
                                    Edit Details
                                </Button>
                            </div>
                            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">First Name</Label>
                                        <Input id="firstName" {...register("firstName")} className="bg-background/50 border-muted-foreground/20 focus:border-green-500/50 focus:ring-green-500/20" />
                                        {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Last Name</Label>
                                        <Input id="lastName" {...register("lastName")} className="bg-background/50 border-muted-foreground/20 focus:border-green-500/50 focus:ring-green-500/20" />
                                        {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input value={worker?.user?.email || ""} disabled className="pl-9 bg-muted/20 border-transparent text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Location</Label>
                                        <div className="w-full">
                                            <CitySelect
                                                value={watch("city") || ""}
                                                onChange={(val) => setValue("city", val, { shouldDirty: true })}
                                            />
                                        </div>
                                        {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Specialties & Domains */}
                        <section className="space-y-4">
                            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden px-6 py-6">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold font-spline text-foreground">Specialties & Domains</h3>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 dark:text-primary dark:hover:text-primary/80 dark:hover:bg-primary/20 font-semibold px-2">
                                                    <Plus className="h-4 w-4 mr-1.5" /> Add More
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-0" align="end">
                                                <div className="p-4 max-h-80 overflow-y-auto">
                                                    <h4 className="font-semibold mb-2 text-sm">Select Domains</h4>
                                                    <DomainMultiSelect
                                                        value={selectedDomains}
                                                        onChange={handleDomainChange}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Selected Domains Tags */}
                                    <div className="flex flex-wrap gap-3 min-h-[40px]">
                                        {selectedDomains.length > 0 ? (
                                            selectedDomains.map((id) => {
                                                const domainName = domainsData?.data?.find(d => d.id === id)?.name ||
                                                    worker?.domains?.find(d => d.domainId === id)?.domain?.name ||
                                                    "Loading...";

                                                return (
                                                    <Badge
                                                        key={id}
                                                        variant="secondary"
                                                        className="pl-3 pr-1.5 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 transition-colors flex items-center gap-1.5 rounded-full border border-primary/20 dark:border-primary/20"
                                                    >
                                                        {domainName}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDomainChange(selectedDomains.filter(d => d !== id))}
                                                            className="hover:bg-primary/10 hover:text-primary dark:hover:text-primary rounded-full p-0.5 transition-colors ml-1"
                                                            aria-label={`Remove ${domainName}`}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </Badge>
                                                )
                                            })
                                        ) : (
                                            <div className="w-full flex justify-center py-4 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/5">
                                                <p className="text-sm text-muted-foreground italic">No domains selected yet</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Primary Domain (Speciality) & Experience */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-foreground">Primary Domain</Label>
                                            <Select
                                                value={watch("specialityId")?.toString() || ""}
                                                onValueChange={(val) => setValue("specialityId", parseInt(val), { shouldDirty: true })}
                                            >
                                                <SelectTrigger className="bg-background/50 border-input shadow-sm focus:ring-2 focus:ring-blue-500/20 h-11 rounded-lg">
                                                    <SelectValue placeholder="Select your primary domain" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {specialities.map((s) => (
                                                        <SelectItem key={s.id} value={s.id.toString()}>
                                                            {s.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-foreground">Years of Experience</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    {...register("experienceYears", { valueAsNumber: true })}
                                                    className="pl-10 h-11 bg-background/50 border-input shadow-sm focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                                                    placeholder="e.g. 5"
                                                    min={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Professional Bio */}
                        <section className="space-y-4">
                            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden px-6 py-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold font-spline text-foreground mb-6">Professional Bio</h3>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-foreground">About You</Label>
                                            <Textarea
                                                {...register("bio")}
                                                placeholder="Write a few sentences about your professional background and expertise..."
                                                className="min-h-[180px] bg-background/50 border-input shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y p-4 text-base leading-relaxed rounded-xl"
                                                maxLength={2000}
                                            />
                                            <div className="flex justify-end pt-1">
                                                <span className="text-xs text-muted-foreground font-medium">{watchedBio.length} / 2000 characters</span>
                                            </div>
                                            {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </section>

                    </div>
                </div>
                {/* Action Buttons */}
                <div className="max-w-7xl mx-auto flex justify-end gap-3 py-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={!isDirty || isUpdating}
                        className="hover:bg-muted/50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isDirty || isUpdating}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 transition-all active:scale-95"
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
                <div className="h-4"></div>
            </div>
        </div>
    );
}
