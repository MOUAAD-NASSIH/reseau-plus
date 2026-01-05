import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstitutionProfile, useUpdateInstitutionProfile } from "@/features/hooks/useInstitutions";
import { updateInstitutionProfileSchema, type UpdateInstitutionProfileInput } from "@/features/validation/institutionSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function InstitutionProfile() {
    const { data: profileData, isLoading } = useInstitutionProfile();
    const updateProfile = useUpdateInstitutionProfile();

    const institution = profileData?.data;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<UpdateInstitutionProfileInput>({
        resolver: zodResolver(updateInstitutionProfileSchema),
        defaultValues: {
            institutionName: "",
            address: "",
            city: "",
        },
    });

    // Reset form when profile data loads
    useEffect(() => {
        if (institution) {
            reset({
                institutionName: institution.institutionName || "",
                address: institution.address || "",
                city: institution.city || "",
                latitude: institution.latitude || undefined,
                longitude: institution.longitude || undefined,
            });
        }
    }, [institution, reset]);

    const onSubmit = async (data: UpdateInstitutionProfileInput) => {
        try {
            await updateProfile.mutateAsync(data);
            showSuccessToast("Profile updated", "Your institution profile has been updated successfully.");
        } catch (error) {
            showErrorToast(error, "Failed to update profile. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
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
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Institution Profile</CardTitle>
                <CardDescription>
                    Update your institution's information. This information will be visible to workers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Institution Name */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="institutionName">Institution Name *</Label>
                            <Input
                                id="institutionName"
                                {...register("institutionName")}
                                placeholder="Enter institution name"
                            />
                            {errors.institutionName && (
                                <p className="text-sm text-destructive">{errors.institutionName.message}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                {...register("address")}
                                placeholder="Enter street address"
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">{errors.address.message}</p>
                            )}
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                {...register("city")}
                                placeholder="Enter city"
                            />
                            {errors.city && (
                                <p className="text-sm text-destructive">{errors.city.message}</p>
                            )}
                        </div>

                        {/* Coordinates (optional, for map integration) */}
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude (optional)</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="any"
                                {...register("latitude", { valueAsNumber: true })}
                                placeholder="e.g., 48.8566"
                            />
                            {errors.latitude && (
                                <p className="text-sm text-destructive">{errors.latitude.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude (optional)</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                {...register("longitude", { valueAsNumber: true })}
                                placeholder="e.g., 2.3522"
                            />
                            {errors.longitude && (
                                <p className="text-sm text-destructive">{errors.longitude.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Account Info (read-only) */}
                    {institution?.user && (
                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-medium mb-3">Account Information</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={institution.user.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Member Since</Label>
                                    <Input
                                        value={new Date(institution.createdAt).toLocaleDateString()}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isDirty}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
