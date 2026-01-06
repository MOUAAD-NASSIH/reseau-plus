import { useNavigate } from "react-router";
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
import { useCreateMissionMutation } from "@/features/api/endpoints/missionEndpoints";
import { useGetDomainsQuery, useGetSpecialitiesQuery } from "@/features/api/endpoints/domainEndpoints";
import { createMissionSchema, type CreateMissionInput } from "@/features/validation/missionSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function CreateMission() {
    const navigate = useNavigate();
    const [createMission, { isLoading: isCreating }] = useCreateMissionMutation();
    const { data: domainsData, isLoading: domainsLoading } = useGetDomainsQuery();
    const { data: specialitiesData, isLoading: specialitiesLoading } = useGetSpecialitiesQuery();

    const domains = domainsData?.data || [];
    const specialities = specialitiesData?.data || [];

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateMissionInput>({
        resolver: zodResolver(createMissionSchema),
        defaultValues: {
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            location: "",
            urgency: "MEDIUM",
            domainIds: [],
        },
    });

    const selectedDomains = watch("domainIds") || [];
    const selectedUrgency = watch("urgency");

    const handleDomainToggle = (domainId: number) => {
        const current = selectedDomains;
        const updated = current.includes(domainId)
            ? current.filter((id) => id !== domainId)
            : [...current, domainId];
        setValue("domainIds", updated, { shouldValidate: true });
    };

    const onSubmit = async (data: CreateMissionInput) => {
        try {
            await createMission(data).unwrap();
            showSuccessToast("Mission created", "Your mission has been created successfully.");
            navigate("/institution/missions");
        } catch (error) {
            showErrorToast(error, "Failed to create mission. Please try again.");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Mission</CardTitle>
                <CardDescription>
                    Fill in the details below to create a new mission. Workers will be able to apply once published.
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
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Schedule</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date *</Label>
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
                                <Label htmlFor="endDate">End Date *</Label>
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
                                    onValueChange={(value) => setValue("urgency", value as "HIGH" | "MEDIUM" | "LOW")}
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
                                        onValueChange={(value) => setValue("requiredSpecialityId", parseInt(value))}
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
                        <Button type="submit" disabled={isSubmitting || isCreating}>
                            {isSubmitting || isCreating ? "Creating..." : "Create Mission"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

