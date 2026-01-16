import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Save,
    Menu,
    ChevronRight,
    Verified,
    ToggleLeft,
    Shield,
    MapPin,
    Mail,
    Phone,
    Briefcase,
    Pencil,
    Loader2,
    Upload,
    MoreVertical
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    useGetWorkerProfileQuery,
    useUpdateWorkerProfileMutation,
    useUploadProfilePictureMutation,
    useDeleteProfilePictureMutation,
    useGetWorkerDocumentsQuery,
} from "@/features/api/endpoints/workerEndpoints";
import { ProfilePictureUpload } from "@/components/common/ProfilePictureUpload";
import {
    updateWorkerProfileSchema,
    type UpdateWorkerProfileInput,
} from "@/features/validation/workerSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function WorkerProfile() {
    // API Hooks
    const { data: profileData, isLoading: profileLoading } = useGetWorkerProfileQuery();
    const { data: documentsData } = useGetWorkerDocumentsQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateWorkerProfileMutation();
    const [uploadProfilePicture, { isLoading: isUploadingPicture }] = useUploadProfilePictureMutation();
    const [deleteProfilePicture, { isLoading: isDeletingPicture }] = useDeleteProfilePictureMutation();

    const worker = profileData?.data;
    const documents = documentsData?.data || [];

    // Local State
    const [acceptingMissions, setAcceptingMissions] = useState(true); // TODO: Link to actual availability endpoint if needed
    const [bio, setBio] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form Setup
    const {
        register,
        handleSubmit,
        reset,
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
        },
    });

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
            });
            if (worker.bio) setBio(worker.bio);
            // setAcceptingMissions(worker.isAvailable); // If available in API
        }
    }, [worker, reset]);

    const onSubmit = async (data: UpdateWorkerProfileInput) => {
        try {
            await updateProfile({ ...data, bio }).unwrap();
            showSuccessToast("Profile updated", "Your profile has been saved successfully.");
        } catch (error) {
            showErrorToast(error, "Failed to update profile");
        }
    };

    const handleProfilePictureUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("profilePicture", file);
        try {
            await uploadProfilePicture(formData).unwrap();
            showSuccessToast("Profile picture updated", "Your profile picture has been uploaded successfully.");
        } catch (error) {
            showErrorToast(error, "Failed to upload profile picture");
        }
    };

    const handleProfilePictureDelete = async () => {
        try {
            await deleteProfilePicture().unwrap();
            showSuccessToast("Profile picture removed", "Your profile picture has been deleted.");
        } catch (error) {
            showErrorToast(error, "Failed to delete profile picture");
        }
    };

    const handleCancel = () => {
        reset();
        if (worker?.bio) setBio(worker.bio);
    };

    // Calculate profile completion
    const calculateCompletion = () => {
        let completed = 0;
        const total = 6;

        if (worker?.firstName && worker?.lastName) completed++;
        if (worker?.user?.email) completed++;
        if (worker?.city) completed++;
        if (worker?.specialityId) completed++;
        if (worker?.experienceYears) completed++;
        if (bio) completed++;

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
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            {/* Top Navbar */}
            <header className="flex items-center justify-between h-16 px-6 lg:px-10 border-b border-border bg-card z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-foreground hover:text-primary transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight">
                            Worker Portal
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={!isDirty || isUpdating}
                            className="hidden sm:flex"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={!isDirty || isUpdating}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isUpdating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </header>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-10">
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                            <span>Profile</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-foreground">Edit</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mt-1">
                            My Profile
                        </h1>
                        <p className="text-muted-foreground text-base max-w-2xl">
                            Manage your personal information, specialized skills, and visibility
                            settings to get matched with the right missions.
                        </p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Profile Card & Status */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Profile Card */}
                            <Card className="p-0 border border-border bg-card overflow-hidden flex flex-col items-center text-center relative group shadow-sm hover:shadow-md transition-shadow">
                                <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-primary/10 to-transparent"></div>
                                <div className="relative mt-8 mb-4">
                                    <ProfilePictureUpload
                                        currentImage={worker?.profilePicture}
                                        name={`${worker?.firstName || ''} ${worker?.lastName || ''}`}
                                        onUpload={handleProfilePictureUpload}
                                        onDelete={handleProfilePictureDelete}
                                        isLoading={isUploadingPicture}
                                        isDeleting={isDeletingPicture}
                                        size="xl"
                                        className="border-4 border-card shadow-xl"
                                    />
                                </div>

                                <div className="px-6 pb-6 w-full flex flex-col items-center">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {worker?.firstName} {worker?.lastName}
                                    </h2>
                                    <p className="text-primary font-medium flex items-center gap-2 mt-1">
                                        {worker?.speciality?.name || "Social Worker"}
                                    </p>

                                    {worker?.status === "VERIFIED" && (
                                        <Badge className="mt-4 bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25 border-green-500/20 px-3 py-1 flex items-center gap-1.5">
                                            <Verified className="w-3.5 h-3.5 fill-current" />
                                            <span>Label Réseau: Active</span>
                                        </Badge>
                                    )}

                                    <Separator className="my-6" />

                                    <div className="w-full space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-muted-foreground">Profile Completion</span>
                                            <span className="font-bold text-primary">{profileCompletion}%</span>
                                        </div>
                                        <Progress value={profileCompletion} className="h-2 bg-muted" />
                                        <p className="text-xs text-muted-foreground text-start">
                                            {profileCompletion < 100
                                                ? "Complete your bio and details to reach 100%."
                                                : "Your profile is fully optimized!"}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Availability Card */}
                            <Card className="p-6 border border-border bg-card shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <ToggleLeft className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-foreground">Availability</h3>
                                    </div>
                                    <Switch
                                        checked={acceptingMissions}
                                        onCheckedChange={setAcceptingMissions}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Accepting New Missions
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Turn this off if you are fully booked or on leave.
                                    </p>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column: Edit Forms */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            {/* Personal Info */}
                            <Card className="border border-border bg-card shadow-sm">
                                <div className="p-6 lg:p-8 flex flex-col gap-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                Personal Information
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Update your contact details and location.
                                            </p>
                                        </div>
                                        <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5">
                                            View Public Profile
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Full Name
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    {...register("firstName")}
                                                    placeholder="First Name"
                                                    className="bg-muted/30 focus:bg-background transition-colors"
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Job Title (Speciality)
                                            </Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    value={worker?.speciality?.name || "Social Worker"}
                                                    disabled
                                                    className="pl-9 bg-muted/30"
                                                />
                                            </div>
                                            {/* Note: Speciality is often managed by admin or selection, here just displayed */}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    value={worker?.user?.email || ""}
                                                    disabled
                                                    className="pl-9 bg-muted/30"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Phone Number
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="+1 (555) 012-3456"
                                                    disabled // Assuming phone is not editable here directly or managed elsewhere
                                                    className="pl-9 bg-muted/30"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Office Address / City
                                            </Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...register("city")}
                                                    placeholder="e.g. Springfield"
                                                    className="pl-9 bg-muted/30 focus:bg-background transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Professional Summary */}
                            <Card className="border border-border bg-card shadow-sm">
                                <div className="p-6 lg:p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <Pencil className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                Professional Summary
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Briefly describe your experience and approach to social work.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Example: Dedicated Clinical Social Worker with over 8 years of experience in high-impact mental health settings..."
                                            className="min-h-[150px] bg-muted/30 focus:bg-background resize-y text-base leading-relaxed"
                                            maxLength={500}
                                        />
                                        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                                            {bio.length}/500
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Domains & Skills (Assuming Domains = Areas of Expertise) */}
                            {/* Note: This section would ideally manage 'Domains' via API */}
                            {/* For now we show what we have or a placeholder UI for domains management */}
                            <Card className="border border-border bg-card shadow-sm">
                                <div className="p-6 lg:p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                Domains of Expertise
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Areas where you have verified expertise.
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" className="hidden">
                                            + Add Domain
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {worker?.domains && worker.domains.length > 0 ? (
                                            worker.domains.map((wd) => (
                                                <Badge
                                                    key={wd.id}
                                                    variant="secondary"
                                                    className="px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                                >
                                                    {wd.domain?.name || "Unknown Domain"}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No domains selected yet.</p>
                                        )}
                                        {/* Static Example if no data */}
                                        {(!worker?.domains || worker.domains.length === 0) && (
                                            <Badge variant="outline" className="border-dashed border-muted-foreground/50 text-muted-foreground cursor-not-allowed opacity-50">
                                                Add Domain +
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Documents */}
                            <Card className="border border-border bg-card shadow-sm">
                                <div className="p-6 lg:p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                Documents & Certifications
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Upload your degrees and licenses for verification.
                                            </p>
                                        </div>
                                        <Button variant="outline" className="gap-2">
                                            <Upload className="h-4 w-4" />
                                            Upload Not Supported
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {documents.length > 0 ? (
                                            documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg hover:border-primary/50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                            <Shield className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-foreground text-sm font-medium">
                                                                {doc.name || doc.type}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {doc.type} • Verified
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                No documents uploaded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="h-10"></div>
                </div>
            </div>
        </div>
    );
}
