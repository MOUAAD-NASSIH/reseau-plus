/**
 * WorkerAvailability Page
 * Allows workers to set and manage their available time slots via a calendar.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AvailabilityCalendar } from "@/components/common/AvailabilityCalendar";
import {
    useGetWorkerAvailabilitiesQuery,
    useAddAvailabilityMutation,
    useUpdateAvailabilityMutation,
    useDeleteAvailabilityMutation,
} from "@/features/api/endpoints/workerEndpoints";
import type { CreateAvailabilityInput } from "@/features/validation/workerSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function WorkerAvailability() {
    const { data: availabilitiesData, isLoading } = useGetWorkerAvailabilitiesQuery();

    const [addAvailability] = useAddAvailabilityMutation();
    const [updateAvailability] = useUpdateAvailabilityMutation();
    const [deleteAvailability] = useDeleteAvailabilityMutation();

    const availabilities = availabilitiesData?.data || [];

    const handleCreateSlot = async (data: CreateAvailabilityInput): Promise<void> => {
        try {
            await addAvailability(data).unwrap();
            showSuccessToast("Availability added", "Your availability has been saved.");
        } catch (error) {
            showErrorToast(error, "Failed to add availability");
            throw error;
        }
    };

    const handleUpdateSlot = async (id: number, data: CreateAvailabilityInput): Promise<void> => {
        try {
            await updateAvailability({ id, data }).unwrap();
            showSuccessToast("Availability updated", "Your availability has been updated.");
        } catch (error) {
            showErrorToast(error, "Failed to update availability");
            throw error;
        }
    };

    const handleDeleteSlot = async (id: number): Promise<void> => {
        try {
            await deleteAvailability(id).unwrap();
            showSuccessToast("Availability deleted", "Your availability has been removed.");
        } catch (error) {
            showErrorToast(error, "Failed to delete availability");
            throw error;
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

