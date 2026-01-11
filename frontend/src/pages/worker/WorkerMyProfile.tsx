import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Save,
    X,
    Upload,
    Edit,
    MoreVertical,
    Bell,
    Menu,
    ChevronRight,
    Search,
    Verified,
    ToggleLeft,
    Shield,
    GraduationCap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    useGetWorkerProfileQuery,
    useUpdateWorkerProfileMutation,
    useUploadProfilePictureMutation,
} from "@/features/api/endpoints/workerEndpoints";
import {
    updateWorkerProfileSchema,
    type UpdateWorkerProfileInput,
} from "@/features/validation/workerSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function WorkerMyProfile() {
    const { data: profileData, isLoading: profileLoading } = useGetWorkerProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateWorkerProfileMutation();
    const [uploadProfilePicture, { isLoading: isUploadingPicture }] = useUploadProfilePictureMutation();

    const worker = profileData?.data;

    const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([
        "Child Protection",
        "Family Counseling",
        "Crisis Intervention",
    ]);
    const [newSpeciality, setNewSpeciality] = useState("");
    const [acceptingMissions, setAcceptingMissions] = useState(true);
    const [bio, setBio] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const handleCancel = () => {
        reset();
        if (worker?.bio) setBio(worker.bio);
    };

    const addSpeciality = () => {
        if (newSpeciality && !selectedSpecialities.includes(newSpeciality)) {
            setSelectedSpecialities([...selectedSpecialities, newSpeciality]);
            setNewSpeciality("");
        }
    };

    const removeSpeciality = (spec: string) => {
        setSelectedSpecialities(selectedSpecialities.filter((s) => s !== spec));
    };

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showErrorToast(new Error("Invalid file type"), "Please upload an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showErrorToast(new Error("File too large"), "Image must be less than 5MB");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            await uploadProfilePicture(formData).unwrap();
            showSuccessToast("Profile picture updated", "Your profile picture has been uploaded successfully.");
        } catch (error) {
            showErrorToast(error, "Failed to upload profile picture");
        }
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner loading-spinner-lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top Navbar */}
            <header className="flex items-center justify-between h-16 px-6 lg:px-10 border-b border-border bg-card/95 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-foreground"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight">
                        Worker Portal
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 size-2 bg-primary rounded-full"></span>
                    </button>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={!isDirty || isUpdating}
                            className="hidden sm:flex"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={!isDirty || isUpdating}
                            className="btn-glow"
                        >
                            {isUpdating ? (
                                <div className="loading-spinner loading-spinner-sm mr-2" />
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
                <div className="max-w-6xl mx-auto flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                            <span>Profile</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-foreground">Edit</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                            My Profile
                        </h1>
                        <p className="text-muted-foreground text-base max-w-2xl">
                            Manage your personal information, specialized skills, and visibility
                            settings to get matched with the right missions.
                        </p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Profile Card & Status */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Profile Card */}
                            <Card className="p-6 border border-border flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-b from-primary/20 to-transparent opacity-50"></div>
                                <div className="relative mt-4 mb-4">
                                    <div
                                        className="size-32 rounded-full border-4 border-background shadow-xl bg-cover bg-center bg-no-repeat bg-muted flex items-center justify-center text-4xl font-bold text-foreground overflow-hidden"
                                        style={worker?.profilePicture ? {
                                            backgroundImage: `url(${worker.profilePicture})`
                                        } : {}}
                                    >
                                        {!worker?.profilePicture && (
                                            <>{worker?.firstName?.[0]}{worker?.lastName?.[0]}</>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="profilePictureUpload"
                                        accept="image/*"
                                        onChange={handleProfilePictureUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => document.getElementById('profilePictureUpload')?.click()}
                                        disabled={isUploadingPicture}
                                        className="absolute bottom-1 right-1 bg-card border border-border p-2 rounded-full text-foreground hover:text-primary hover:border-primary transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploadingPicture ? (
                                            <div className="loading-spinner loading-spinner-sm" />
                                        ) : (
                                            <Edit className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {worker?.firstName} {worker?.lastName}
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    {worker?.speciality?.name || "Social Worker"}
                                </p>

                                {/* Label Réseau Badge */}
                                {worker?.status === "VERIFIED" && (
                                    <Badge
                                        variant="outline"
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-primary/30 text-primary mb-6"
                                    >
                                        <Verified className="h-5 w-5" />
                                        <span className="text-sm font-bold">
                                            Label Réseau: Active
                                        </span>
                                    </Badge>
                                )}

                                <div className="w-full flex flex-col gap-3">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-sm font-medium text-foreground">
                                            Profile Completion
                                        </span>
                                        <span className="text-sm font-bold text-primary">
                                            {profileCompletion}%
                                        </span>
                                    </div>
                                    <Progress value={profileCompletion} className="h-2" />
                                    <p className="text-xs text-muted-foreground text-left mt-1">
                                        {profileCompletion < 100
                                            ? "Add a professional summary to reach 100%."
                                            : "Your profile is complete!"}
                                    </p>
                                </div>
                            </Card>

                            {/* Availability Card */}
                            <Card className="p-6 border border-border">
                                <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                                    <ToggleLeft className="h-5 w-5 text-primary" />
                                    Availability
                                </h3>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-foreground text-sm">
                                        Accepting New Missions
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={acceptingMissions}
                                            onChange={(e) =>
                                                setAcceptingMissions(e.target.checked)
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Turn this off if you are fully booked or on leave.
                                </p>
                            </Card>
                        </div>

                        {/* Right Column: Edit Forms */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            {/* Personal Info */}
                            <Card className="p-6 lg:p-8 border border-border">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-1">
                                            Personal Information
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Update your contact details and location.
                                        </p>
                                    </div>
                                    <Button variant="link" className="text-primary text-sm">
                                        View Public Profile
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Full Name
                                        </Label>
                                        <Input
                                            {...register("firstName")}
                                            placeholder="Enter your first name"
                                            className="bg-muted/50"
                                        />
                                        {errors.firstName && (
                                            <p className="form-error">{errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Job Title
                                        </Label>
                                        <Input
                                            value={worker?.speciality?.name || "Social Worker"}
                                            disabled
                                            className="bg-muted/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Email Address
                                        </Label>
                                        <div className="relative input-with-icon">
                                            <svg
                                                className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <Input
                                                type="email"
                                                value={worker?.user?.email || ""}
                                                disabled
                                                className="pl-10 bg-muted/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Phone Number
                                        </Label>
                                        <div className="relative input-with-icon">
                                            <svg
                                                className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                            <Input
                                                type="tel"
                                                placeholder="+1 (555) 012-3456"
                                                disabled
                                                className="pl-10 bg-muted/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Office Address
                                        </Label>
                                        <div className="relative input-with-icon">
                                            <svg
                                                className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <Input
                                                {...register("city")}
                                                placeholder="123 Community Center Dr, Suite 400, Springfield"
                                                className="pl-10 bg-muted/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Professional Summary */}
                            <Card className="p-6 lg:p-8 border border-border">
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    Professional Summary
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Briefly describe your experience and approach to social work.
                                </p>
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Write a few sentences about yourself..."
                                    className="w-full h-32 bg-muted/50 resize-none"
                                    maxLength={500}
                                />
                                <div className="flex justify-end mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        {bio.length}/500 characters
                                    </span>
                                </div>
                            </Card>

                            {/* Skills & Specializations */}
                            <Card className="p-6 lg:p-8 border border-border">
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    Specializations
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Select the areas where you have verified expertise.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedSpecialities.map((spec) => (
                                        <Badge
                                            key={spec}
                                            variant="outline"
                                            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/20 text-primary border-primary/30 text-sm font-medium"
                                        >
                                            {spec}
                                            <button
                                                type="button"
                                                onClick={() => removeSpeciality(spec)}
                                                className="hover:text-foreground ml-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        value={newSpeciality}
                                        onChange={(e) => setNewSpeciality(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addSpeciality();
                                            }
                                        }}
                                        placeholder="Add a specialization (e.g. Substance Abuse, Elderly Care...)"
                                        className="w-full bg-muted/50 rounded-full pl-12 pr-4 py-3"
                                    />
                                </div>
                            </Card>

                            {/* Documents */}
                            <Card className="p-6 lg:p-8 border border-border">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-1">
                                            Documents & Certifications
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Upload your degrees and licenses for verification.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 text-primary bg-primary/10 hover:bg-primary/20 border-primary/30"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg group hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded bg-primary/20 flex items-center justify-center text-primary">
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-foreground text-sm font-medium">
                                                    State Social Work License.pdf
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Verified on Oct 12, 2023
                                                </p>
                                            </div>
                                        </div>
                                        <button className="text-muted-foreground hover:text-foreground p-2">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg group hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded bg-primary/20 flex items-center justify-center text-primary">
                                                <GraduationCap className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-foreground text-sm font-medium">
                                                    Master of Social Work Degree.pdf
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Verified on Sep 05, 2023
                                                </p>
                                            </div>
                                        </div>
                                        <button className="text-muted-foreground hover:text-foreground p-2">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Footer spacer */}
                    <div className="h-10"></div>
                </div>
            </div>
        </div>
    );
}
