import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useMission, useUpdateMission } from "@/features/hooks/useMissions";
import { useDomains, useSpecialities } from "@/features/hooks/useDomains";
import { updateMissionSchema, type UpdateMissionInput } from "@/features/validation/missionSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function EditMission() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const missionId = parseInt(id || "0");

    const { data: missionData, isLoading: missionLoading } = useMission(missionId);
    const updateMission = useUpdateMission();
    const { data: domainsData, isLoading: domainsLoading } = useDomains();
    const { data: specialitiesData, isLoading: specialitiesLoading } = useSpecialities();

    const mission = missionData?.data;
    const domains = domainsData?.data || [];
    const specialities = specialitiesData?.data || [];

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<UpdateMissionInput>({
        resolver: zodResolver(updateMissionSchema),
        defaultValues: {
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            location: "",
            urgency: "MEDIUM",
            status: "OPEN",
            domainIds: [],
        },
    });

    const selectedDomains = watch("domainIds") || [];
    const selectedUrgency = watch("urgency");
    const selectedStatus = watch("status");

    // Reset form when mission data loads
    useEffect(() => {
        if (mission) {
            reset({
                title: mission.title || "",
                description: mission.description || "",
                startDate: mission.startDate ? mission.startDate.split("T")[0] : "",
                endDate: mission.endDate ? mission.endDate.split("T")[0] : "",
                location: mission.location || "",
                budget: mission.budget || undefined,
                urgency: mission.urgency || "MEDIUM",
                status: mission.status || "OPEN",
                requiredSpecialityId: mission.requiredSpecialityId || undefined,
                domainIds: mission.domains?.map((d) => d.domainId) || [],
            });
        }
    }, [mission, reset]);

    const handleDomainToggle = (domainId: number) => {
        const current = selectedDomains;
        const updated = current.includes(domainId)
            ? current.filter((id) => id !== domainId)
            : [...current, domainId];
        setValue("domainIds", updated, { shouldValidate: true, shouldDirty: true });
    };

    const onSubmit = async (data: UpdateMissionInput) => {
        try {
            await updateMission.mutateAsync({ id: missionId, data });
            showSuccessToast("Mission updated", "Your mission has been updated successfully.");
            navigate("/institution/missions");
        } catch (error) {
            showErrorToast(error, "Failed to update mission. Please try again.");
        }
    };

    if (missionLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!mission) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Mission not found</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate("/institution/missions")}
                    >
                        Back to Missions
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Mission</CardTitle>
                <CardDescription>
                    Update the mission details below. Changes will be visible to workers immediately.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Basic Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="title">Mission Title *</Label>
                            <Input
                                id="title"
                                {...register("title")}
                                placeholder="Enter mission title"
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Describe the mission requirements and responsibilities"
                                rows={4}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={selectedStatus}
                                onValueChange={(value) => setValue("status", value as "OPEN" | "ONGOING" | "CLOSED" | "CANCELLED", { shouldDirty: true })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-destructive">{errors.status.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Schedule</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...register("startDate")}
                                />
                                {errors.startDate && (
                                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    {...register("endDate")}
                                />
                                {errors.endDate && (
                                    <p className="text-sm text-destructive">{errors.endDate.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location & Budget */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Location & Budget</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    {...register("location")}
                                    placeholder="Enter mission location"
                                />
                                {errors.location && (
                                    <p className="text-sm text-destructive">{errors.location.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget (MAD)</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    step="0.01"
                                    {...register("budget", { valueAsNumber: true })}
                                    placeholder="Enter budget amount"
                                />
                                {errors.budget && (
                                    <p className="text-sm text-destructive">{errors.budget.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Requirements</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="urgency">Urgency Level</Label>
                                <Select
                                    value={selectedUrgency}
                                    onValueChange={(value) => setValue("urgency", value as "HIGH" | "MEDIUM" | "LOW", { shouldDirty: true })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select urgency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.urgency && (
                                    <p className="text-sm text-destructive">{errors.urgency.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requiredSpecialityId">Required Speciality</Label>
                                {specialitiesLoading ? (
                                    <Skeleton className="h-10 w-full" />
                                ) : (
                                    <Select
                                        value={watch("requiredSpecialityId")?.toString() || ""}
                                        onValueChange={(value) => setValue("requiredSpecialityId", value ? parseInt(value) : undefined, { shouldDirty: true })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select speciality (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {specialities.map((speciality) => (
                                                <SelectItem key={speciality.id} value={speciality.id.toString()}>
                                                    {speciality.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.requiredSpecialityId && (
                                    <p className="text-sm text-destructive">{errors.requiredSpecialityId.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Domains */}
                        <div className="space-y-2">
                            <Label>Domains (optional)</Label>
                            {domainsLoading ? (
                                <div className="flex gap-2">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-6 w-24" />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-4 pt-2">
                                    {domains.map((domain) => (
                                        <div key={domain.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`domain-${domain.id}`}
                                                checked={selectedDomains.includes(domain.id)}
                                                onCheckedChange={() => handleDomainToggle(domain.id)}
                                            />
                                            <Label
                                                htmlFor={`domain-${domain.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {domain.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.domainIds && (
                                <p className="text-sm text-destructive">{errors.domainIds.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/institution/missions")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !isDirty}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
