/**
 * WorkerAvailability Page
 * Displays a calendar-based UI for workers to manage their availability slots
 * Requirements: 9.16, 9.17
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AvailabilityCalendar } from "@/components/common/AvailabilityCalendar";
import {
    useWorkerAvailabilities,
    useAddAvailability,
    useUpdateAvailability,
    useDeleteAvailability,
} from "@/features/hooks/useWorkers";
import type { CreateAvailabilityInput } from "@/features/validation/workerSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function WorkerAvailability() {
    // Fetch availability data using existing hook
    const { data: availabilitiesData, isLoading } = useWorkerAvailabilities();

    // CRUD mutations using existing hooks
    const addAvailability = useAddAvailability();
    const updateAvailability = useUpdateAvailability();
    const deleteAvailability = useDeleteAvailability();

    // Extract availabilities array from response
    const availabilities = availabilitiesData?.data || [];

    // Handle create slot - connects to existing mutation
    const handleCreateSlot = async (data: CreateAvailabilityInput): Promise<void> => {
        try {
            await addAvailability.mutateAsync(data);
            showSuccessToast("Availability added", "Your availability has been saved.");
        } catch (error) {
            showErrorToast(error, "Failed to add availability");
            throw error; // Re-throw to let calendar handle UI state
        }
    };

    // Handle update slot - connects to existing mutation
    const handleUpdateSlot = async (id: number, data: CreateAvailabilityInput): Promise<void> => {
        try {
            await updateAvailability.mutateAsync({ id, data });
            showSuccessToast("Availability updated", "Your availability has been updated.");
        } catch (error) {
            showErrorToast(error, "Failed to update availability");
            throw error; // Re-throw to let calendar handle UI state
        }
    };

    // Handle delete slot - connects to existing mutation
    const handleDeleteSlot = async (id: number): Promise<void> => {
        try {
            await deleteAvailability.mutateAsync(id);
            showSuccessToast("Availability deleted", "Your availability has been removed.");
        } catch (error) {
            showErrorToast(error, "Failed to delete availability");
            throw error; // Re-throw to let calendar handle UI state
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Availability</CardTitle>
                    <CardDescription>
                        Set your available dates so institutions know when you can work.
                        Click on the calendar to add new availability, or click on existing slots to edit or delete them.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AvailabilityCalendar
                        availabilities={availabilities}
                        isLoading={isLoading}
                        onCreateSlot={handleCreateSlot}
                        onUpdateSlot={handleUpdateSlot}
                        onDeleteSlot={handleDeleteSlot}
                        defaultView="month"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
