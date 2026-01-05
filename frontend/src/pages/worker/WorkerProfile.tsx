import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useWorkerProfile, useUpdateWorkerProfile } from "@/features/hooks/useWorkers";
import { useSpecialities } from "@/features/hooks/useDomains";
import {
    updateWorkerProfileSchema,
    type UpdateWorkerProfileInput,
} from "@/features/validation/workerSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function WorkerProfile() {
    const { data: profileData, isLoading: profileLoading } = useWorkerProfile();
    const { data: specialitiesData, isLoading: specialitiesLoading } = useSpecialities();
    const updateProfile = useUpdateWorkerProfile();

    const worker = profileData?.data;
    const specialities = specialitiesData?.data || [];

    const {
        register,
        handleSubmit,
        setValue,
        watch,
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
        }
    }, [worker, reset]);

    const onSubmit = async (data: UpdateWorkerProfileInput) => {
        try {
            await updateProfile.mutateAsync(data);
            showSuccessToast("Profile updated", "Your profile has been saved successfully.");
        } catch (error) {
            showErrorToast(error, "Failed to update profile");
        }
    };

    const selectedSpecialityId = watch("specialityId");

    if (profileLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Status Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Account Status</CardTitle>
                            <CardDescription>
                                Your current verification status
                            </CardDescription>
                        </div>
                        {worker && <StatusBadge status={worker.status} />}
                    </div>
                </CardHeader>
                {worker?.status === "PENDING" && (
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Your account is pending verification. Please ensure all your
                            documents are uploaded and your profile is complete.
                        </p>
                    </CardContent>
                )}
                {worker?.status === "REJECTED" && worker.rejectionReason && (
                    <CardContent>
                        <p className="text-sm text-destructive">
                            Rejection reason: {worker.rejectionReason}
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Update your personal details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                {...register("firstName")}
                                placeholder="Enter your first name"
                            />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                {...register("lastName")}
                                placeholder="Enter your last name"
                            />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="birthDate">Birth Date</Label>
                            <Input
                                id="birthDate"
                                type="date"
                                {...register("birthDate")}
                            />
                            {errors.birthDate && (
                                <p className="text-sm text-destructive">
                                    {errors.birthDate.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={watch("gender") || ""}
                                onValueChange={(value) =>
                                    setValue("gender", value || null, { shouldDirty: true })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer_not_to_say">
                                        Prefer not to say
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-sm text-destructive">
                                    {errors.gender.message}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>
                        Your professional details and expertise
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="specialityId">Speciality</Label>
                            {specialitiesLoading ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Select
                                    value={selectedSpecialityId?.toString() || ""}
                                    onValueChange={(value) =>
                                        setValue(
                                            "specialityId",
                                            value ? parseInt(value) : null,
                                            { shouldDirty: true }
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select speciality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {specialities.map((spec) => (
                                            <SelectItem
                                                key={spec.id}
                                                value={spec.id.toString()}
                                            >
                                                {spec.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.specialityId && (
                                <p className="text-sm text-destructive">
                                    {errors.specialityId.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experienceYears">Years of Experience</Label>
                            <Input
                                id="experienceYears"
                                type="number"
                                min="0"
                                max="50"
                                {...register("experienceYears", { valueAsNumber: true })}
                                placeholder="Enter years of experience"
                            />
                            {errors.experienceYears && (
                                <p className="text-sm text-destructive">
                                    {errors.experienceYears.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            {...register("bio")}
                            placeholder="Tell us about yourself and your experience..."
                            rows={4}
                        />
                        {errors.bio && (
                            <p className="text-sm text-destructive">{errors.bio.message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Location</CardTitle>
                    <CardDescription>
                        Your location helps match you with nearby missions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                {...register("city")}
                                placeholder="Enter your city"
                            />
                            {errors.city && (
                                <p className="text-sm text-destructive">
                                    {errors.city.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input
                                id="zipCode"
                                {...register("zipCode")}
                                placeholder="Enter your zip code"
                            />
                            {errors.zipCode && (
                                <p className="text-sm text-destructive">
                                    {errors.zipCode.message}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={updateProfile.isPending || !isDirty}
                >
                    {updateProfile.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
