/**
 * AvailabilityCalendar Component
 * A professional calendar UI for workers to manage their availability slots

 */

import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, type View, type SlotInfo } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Plus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    createAvailabilitySchema,
    type CreateAvailabilityInput,
} from "@/features/validation/workerSchemas";
import type { WorkerAvailability } from "@/types/auth.types";
import {
    mapAvailabilitiesToEvents,
    checkOverlap,
    formatDateForInput,
    formatDateTimeForTooltip,
    type CalendarEvent,
} from "@/lib/calendar-utils";
import { showErrorToast } from "@/lib/toast";

// Import react-big-calendar styles
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// Setup date-fns localizer for react-big-calendar
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Create drag and drop calendar component
const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

// TYPES


interface AvailabilityCalendarProps {
    /** Availability data from existing hooks (passed as props) */
    availabilities: WorkerAvailability[];
    /** Loading state */
    isLoading: boolean;
    /** Callback to create a new availability slot */
    onCreateSlot: (data: CreateAvailabilityInput) => Promise<void>;
    /** Callback to update an existing availability slot */
    onUpdateSlot: (id: number, data: CreateAvailabilityInput) => Promise<void>;
    /** Callback to delete an availability slot */
    onDeleteSlot: (id: number) => Promise<void>;
    /** Default calendar view */
    defaultView?: View;
    /** Minimum time to display (default: 8am) */
    minTime?: Date;
    /** Maximum time to display (default: 8pm) */
    maxTime?: Date;
}

interface SlotFormProps {
    onSubmit: (data: CreateAvailabilityInput) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => void;
    isLoading: boolean;
    isDeleting?: boolean;
    defaultValues?: Partial<CreateAvailabilityInput>;
    submitLabel: string;
    isEditing?: boolean;
}

// SLOT FORM COMPONENT


function SlotForm({
    onSubmit,
    onCancel,
    onDelete,
    isLoading,
    isDeleting,
    defaultValues,
    submitLabel,
    isEditing,
}: SlotFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateAvailabilityInput>({
        resolver: zodResolver(createAvailabilitySchema),
        defaultValues: {
            startDate: defaultValues?.startDate || "",
            endDate: defaultValues?.endDate || "",
            isRecurring: defaultValues?.isRecurring ?? false,
        },
    });

    const isRecurring = watch("isRecurring");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input id="startDate" type="date" {...register("startDate")} />
                    {errors.startDate && (
                        <p className="text-sm text-destructive">{errors.startDate.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input id="endDate" type="date" {...register("endDate")} />
                    {errors.endDate && (
                        <p className="text-sm text-destructive">{errors.endDate.message}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="isRecurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => setValue("isRecurring", checked === true)}
                />
                <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer">
                    This is a recurring availability (repeats weekly)
                </Label>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
                {isEditing && onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isDeleting || isLoading}
                        className="mr-auto"
                    >
                        {isDeleting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                        ) : (
                            <><Trash2 className="mr-2 h-4 w-4" />Delete</>
                        )}
                    </Button>
                )}
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || isDeleting}>
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                        submitLabel
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}

// CALENDAR SKELETON LOADER


function CalendarSkeleton() {
    return (
        <div className="space-y-4">
            {/* Toolbar skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-9 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                </div>
            </div>
            {/* Calendar grid skeleton */}
            <div className="grid grid-cols-7 gap-1">
                {/* Header row */}
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={`header-${i}`} className="h-8" />
                ))}
                {/* Calendar cells */}
                {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={`cell-${i}`} className="h-24" />
                ))}
            </div>
        </div>
    );
}

// CUSTOM EVENT COMPONENT


interface EventComponentProps {
    event: CalendarEvent;
}

function EventComponent({ event }: EventComponentProps) {
    return (
        <div
            className={cn(
                "px-2 py-1 text-xs font-medium rounded truncate",
                event.isPast
                    ? "bg-muted text-muted-foreground opacity-60"
                    : "bg-primary text-primary-foreground"
            )}
            title={`${formatDateTimeForTooltip(event.start)} - ${formatDateTimeForTooltip(event.end)}${event.isRecurring ? " (Recurring)" : ""}`}
        >
            {event.title}
        </div>
    );
}

// MAIN CALENDAR COMPONENT


export function AvailabilityCalendar({
    availabilities,
    isLoading,
    onCreateSlot,
    onUpdateSlot,
    onDeleteSlot,
    defaultView = "month",
}: AvailabilityCalendarProps) {
    // State
    const [view, setView] = useState<View>(defaultView);
    const [date, setDate] = useState(new Date());
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Convert availabilities to calendar events
    const events = useMemo(
        () => mapAvailabilitiesToEvents(availabilities),
        [availabilities]
    );

    // Handle slot selection (click/drag to create)
    const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
        // Set the selected slot dates
        setSelectedSlot({
            start: slotInfo.start,
            end: slotInfo.end,
        });
        setShowCreateDialog(true);
    }, []);

    // Handle event click (edit)
    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowEditDialog(true);
    }, []);

    // Handle event drag and drop
    const handleEventDrop = useCallback(
        async (args: { event: CalendarEvent; start: string | Date; end: string | Date }) => {
            const start = typeof args.start === 'string' ? new Date(args.start) : args.start;
            const end = typeof args.end === 'string' ? new Date(args.end) : args.end;

            // Check for overlap (excluding the current event)
            const newSlot = { start, end, id: args.event.id };
            if (checkOverlap(newSlot, events)) {
                showErrorToast(null, "This time slot overlaps with an existing availability.");
                return;
            }

            try {
                await onUpdateSlot(args.event.id, {
                    startDate: formatDateForInput(start),
                    endDate: formatDateForInput(end),
                    isRecurring: args.event.isRecurring,
                });
            } catch (error) {
                showErrorToast(error, "Failed to move availability");
            }
        },
        [events, onUpdateSlot]
    );

    // Handle event resize
    const handleEventResize = useCallback(
        async (args: { event: CalendarEvent; start: string | Date; end: string | Date }) => {
            const start = typeof args.start === 'string' ? new Date(args.start) : args.start;
            const end = typeof args.end === 'string' ? new Date(args.end) : args.end;

            // Check for overlap (excluding the current event)
            const newSlot = { start, end, id: args.event.id };
            if (checkOverlap(newSlot, events)) {
                showErrorToast(null, "This time slot overlaps with an existing availability.");
                return;
            }

            try {
                await onUpdateSlot(args.event.id, {
                    startDate: formatDateForInput(start),
                    endDate: formatDateForInput(end),
                    isRecurring: args.event.isRecurring,
                });
            } catch (error) {
                showErrorToast(error, "Failed to resize availability");
            }
        },
        [events, onUpdateSlot]
    );


    // Handle create slot submission
    const handleCreateSubmit = async (data: CreateAvailabilityInput) => {
        // Check for overlap
        const newSlot = {
            start: new Date(data.startDate),
            end: new Date(data.endDate),
        };
        if (checkOverlap(newSlot, events)) {
            showErrorToast(null, "This time slot overlaps with an existing availability.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onCreateSlot(data);
            setShowCreateDialog(false);
            setSelectedSlot(null);
        } catch (error) {
            showErrorToast(error, "Failed to create availability");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit slot submission
    const handleEditSubmit = async (data: CreateAvailabilityInput) => {
        if (!selectedEvent) return;

        // Check for overlap (excluding the current event)
        const newSlot = {
            start: new Date(data.startDate),
            end: new Date(data.endDate),
            id: selectedEvent.id,
        };
        if (checkOverlap(newSlot, events)) {
            showErrorToast(null, "This time slot overlaps with an existing availability.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onUpdateSlot(selectedEvent.id, data);
            setShowEditDialog(false);
            setSelectedEvent(null);
        } catch (error) {
            showErrorToast(error, "Failed to update availability");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete confirmation
    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (!selectedEvent) return;

        setIsDeleting(true);
        try {
            await onDeleteSlot(selectedEvent.id);
            setShowDeleteConfirm(false);
            setShowEditDialog(false);
            setSelectedEvent(null);
        } catch (error) {
            showErrorToast(error, "Failed to delete availability");
        } finally {
            setIsDeleting(false);
        }
    };

    // Custom event styling
    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const style: React.CSSProperties = {
            borderRadius: "4px",
            opacity: event.isPast ? 0.5 : 1,
            border: "none",
            display: "block",
        };

        if (event.isPast) {
            style.backgroundColor = "var(--muted)";
            style.color = "var(--muted-foreground)";
        } else {
            style.backgroundColor = "var(--primary)";
            style.color = "var(--primary-foreground)";
        }

        return { style };
    }, []);

    // Loading state
    if (isLoading) {
        return <CalendarSkeleton />;
    }

    // Empty state
    if (availabilities.length === 0 && !showCreateDialog) {
        return (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Availability
                    </Button>
                </div>
                <EmptyState
                    icon={CalendarIcon}
                    title="No availability set"
                    description="Add your available dates so institutions know when you can work."
                    action={
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Availability
                        </Button>
                    }
                />
                {/* Create Dialog for empty state */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Availability</DialogTitle>
                            <DialogDescription>
                                Set your available dates for work
                            </DialogDescription>
                        </DialogHeader>
                        <SlotForm
                            onSubmit={handleCreateSubmit}
                            onCancel={() => {
                                setShowCreateDialog(false);
                                setSelectedSlot(null);
                            }}
                            isLoading={isSubmitting}
                            defaultValues={
                                selectedSlot
                                    ? {
                                        startDate: formatDateForInput(selectedSlot.start),
                                        endDate: formatDateForInput(selectedSlot.end),
                                        isRecurring: false,
                                    }
                                    : undefined
                            }
                            submitLabel="Add Availability"
                        />
                    </DialogContent>
                </Dialog>
            </div>
        );
    }


    return (
        <div className="space-y-4">
            {/* Add button */}
            <div className="flex justify-end">
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Availability
                </Button>
            </div>

            {/* Calendar */}
            <div className="availability-calendar rounded-lg border bg-card p-4">
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    resizable
                    draggableAccessor={() => true}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        event: EventComponent,
                    }}
                    views={["month", "week", "day"]}
                    style={{ height: 600 }}
                    tooltipAccessor={(event: CalendarEvent) =>
                        `${formatDateTimeForTooltip(event.start)} - ${formatDateTimeForTooltip(event.end)}${event.isRecurring ? " (Recurring)" : ""}`
                    }
                />
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Availability</DialogTitle>
                        <DialogDescription>
                            Set your available dates for work
                        </DialogDescription>
                    </DialogHeader>
                    <SlotForm
                        onSubmit={handleCreateSubmit}
                        onCancel={() => {
                            setShowCreateDialog(false);
                            setSelectedSlot(null);
                        }}
                        isLoading={isSubmitting}
                        defaultValues={
                            selectedSlot
                                ? {
                                    startDate: formatDateForInput(selectedSlot.start),
                                    endDate: formatDateForInput(addDays(selectedSlot.end, -1) < selectedSlot.start ? selectedSlot.start : addDays(selectedSlot.end, -1)),
                                    isRecurring: false,
                                }
                                : undefined
                        }
                        submitLabel="Add Availability"
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Availability</DialogTitle>
                        <DialogDescription>
                            Update or delete this availability slot
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEvent && (
                        <SlotForm
                            onSubmit={handleEditSubmit}
                            onCancel={() => {
                                setShowEditDialog(false);
                                setSelectedEvent(null);
                            }}
                            onDelete={handleDeleteClick}
                            isLoading={isSubmitting}
                            isDeleting={isDeleting}
                            defaultValues={{
                                startDate: formatDateForInput(selectedEvent.start),
                                endDate: formatDateForInput(selectedEvent.end),
                                isRecurring: selectedEvent.isRecurring,
                            }}
                            submitLabel="Update Availability"
                            isEditing
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Availability</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this availability slot? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Custom calendar styles */}
            <style>{`
        .availability-calendar .rbc-calendar {
          font-family: inherit;
        }
        .availability-calendar .rbc-header {
          padding: 8px;
          font-weight: 600;
          color: var(--foreground);
          background: var(--muted);
          border-color: var(--border);
        }
        .availability-calendar .rbc-month-view,
        .availability-calendar .rbc-time-view {
          border-color: var(--border);
        }
        .availability-calendar .rbc-day-bg {
          background: var(--background);
        }
        .availability-calendar .rbc-off-range-bg {
          background: var(--muted);
        }
        .availability-calendar .rbc-today {
          background: var(--accent) !important;
        }
        .availability-calendar .rbc-event {
          background: var(--primary);
          border: none;
        }
        .availability-calendar .rbc-event.rbc-selected {
          background: var(--primary);
          box-shadow: 0 0 0 2px var(--ring);
        }
        .availability-calendar .rbc-toolbar button {
          color: var(--foreground);
          border-color: var(--border);
          background: var(--background);
        }
        .availability-calendar .rbc-toolbar button:hover {
          background: var(--muted);
        }
        .availability-calendar .rbc-toolbar button.rbc-active {
          background: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
        }
        .availability-calendar .rbc-month-row,
        .availability-calendar .rbc-day-slot .rbc-time-slot {
          border-color: var(--border);
        }
        .availability-calendar .rbc-timeslot-group {
          border-color: var(--border);
        }
        .availability-calendar .rbc-time-content {
          border-color: var(--border);
        }
        .availability-calendar .rbc-time-header-content {
          border-color: var(--border);
        }
        .availability-calendar .rbc-date-cell {
          color: var(--foreground);
          padding: 4px 8px;
        }
        .availability-calendar .rbc-date-cell.rbc-off-range {
          color: var(--muted-foreground);
        }
        .availability-calendar .rbc-show-more {
          color: var(--primary);
          font-weight: 500;
        }
        .availability-calendar .rbc-current-time-indicator {
          background: var(--destructive);
        }
        /* Dark mode adjustments */
        .dark .availability-calendar .rbc-toolbar button {
          background: var(--card);
        }
        .dark .availability-calendar .rbc-day-bg {
          background: var(--card);
        }
      `}</style>
        </div>
    );
}

export default AvailabilityCalendar;

