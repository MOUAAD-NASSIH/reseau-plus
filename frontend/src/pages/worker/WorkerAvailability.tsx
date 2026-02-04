import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Calendar,
    CheckCircle2,
    Ban,
    ArrowRight,
    Stethoscope,
} from "lucide-react";
import {
    useGetWorkerAvailabilitiesQuery,
    useAddAvailabilityMutation,
    useDeleteAvailabilityMutation,
} from "@/features/api/endpoints/workerEndpoints";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useGetMyAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import type { CreateAvailabilityInput } from "@/features/validation/workerSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

// Types
interface CalendarDay {
    date: number;
    isCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
    isWeekend: boolean;
    status?: "available" | "booked" | "blocked";
    timeRange?: string;
    mission?: {
        name: string;
        time: string;
        color: string;
    };
}



export default function WorkerAvailability() {
    const { t, i18n } = useTranslation();
    const { data: availabilitiesData, refetch: refetchAvailabilities } = useGetWorkerAvailabilitiesQuery();
    const { data: assignmentsData } = useGetMyAssignmentsQuery();
    const [addAvailability] = useAddAvailabilityMutation();
    const [deleteAvailability] = useDeleteAvailabilityMutation();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<number[]>([new Date().getDate()]); // Array of selected dates
    const [viewMode, setViewMode] = useState<"month" | "week">("month");
    const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "blocked">("available");
    const [timeSlot, setTimeSlot] = useState<"morning" | "allday" | "afternoon">("allday");
    const [timeRange, setTimeRange] = useState({ start: "08:00", end: "17:00" });
    const [selectedAvailability, setSelectedAvailability] = useState<any>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Close sheet when switching to desktop view
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            if (e.matches) {
                setIsSheetOpen(false);
            }
        };

        // Initial check
        handleChange(mediaQuery);

        // Listen for changes
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Get upcoming missions from assignments
    const upcomingMissions = useMemo(() => {
        if (!assignmentsData?.data) return [];

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return assignmentsData.data
            .filter((assignment: any) => {
                // Only show ACTIVE or ONGOING assignments
                if (assignment.status !== 'ACTIVE' && assignment.status !== 'ONGOING') {
                    return false;
                }

                const startDate = new Date(assignment.startDate);
                return startDate >= now;
            })
            .sort((a: any, b: any) => {
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            })
            .slice(0, 5)
            .map((assignment: any) => {
                const startDate = new Date(assignment.startDate);
                const endDate = new Date(assignment.endDate);

                return {
                    id: assignment.id,
                    name: assignment.mission?.institution?.name || 'Mission',
                    date: startDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
                    timeRange: `${startDate.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit', hour12: false })}`,
                    icon: 'hospital' as const,
                    color: 'green',
                };
            });
    }, [assignmentsData]);

    // Helper function to check if a date has availability
    const getAvailabilityForDate = (year: number, month: number, date: number) => {
        if (!availabilitiesData?.data) return null;

        const targetDate = new Date(year, month, date);
        targetDate.setHours(0, 0, 0, 0);

        return availabilitiesData.data.find((avail: any) => {
            const availStart = new Date(avail.startDate);
            availStart.setHours(0, 0, 0, 0);
            return availStart.getTime() === targetDate.getTime();
        });
    };

    // Generate calendar days
    const generateCalendarDays = (): CalendarDay[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: CalendarDay[] = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const prevMonthDate = new Date(year, month - 1, daysInPrevMonth - i);
            const dayOfWeek = prevMonthDate.getDay();
            days.push({
                date: daysInPrevMonth - i,
                isCurrentMonth: false,
                isSelected: false,
                isToday: false,
                isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            });
        }

        // Current month days
        for (let date = 1; date <= daysInMonth; date++) {
            const currentDayDate = new Date(year, month, date);
            const dayOfWeek = currentDayDate.getDay();
            const day: CalendarDay = {
                date,
                isCurrentMonth: true,
                isSelected: selectedDates.includes(date) && month === currentDate.getMonth() && year === currentDate.getFullYear(),
                isToday: date === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(),
                isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            };

            // Map actual availability data to calendar days
            const availability = getAvailabilityForDate(year, month, date);
            if (availability) {
                const startDate = new Date(availability.startDate);
                const endDate = new Date(availability.endDate);

                // Use UTC methods to avoid timezone issues
                const startHours = String(startDate.getUTCHours()).padStart(2, '0');
                const startMinutes = String(startDate.getUTCMinutes()).padStart(2, '0');
                const endHours = String(endDate.getUTCHours()).padStart(2, '0');
                const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');

                day.status = availability.status === "blocked" ? "blocked" : "available";
                day.timeRange = `${startHours}:${startMinutes}-${endHours}:${endMinutes}`;
            }

            days.push(day);
        }

        // Next month days to fill the grid
        const totalCells = 35; // 5 rows × 7 days
        const remainingCells = totalCells - days.length;
        for (let date = 1; date <= remainingCells; date++) {
            const nextMonthDate = new Date(year, month + 1, date);
            const dayOfWeek = nextMonthDate.getDay();
            days.push({
                date,
                isCurrentMonth: false,
                isSelected: false,
                isToday: false,
                isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            });
        }

        return days;
    };

    // Generate week view days (current week only)
    const generateWeekDays = (): CalendarDay[] => {
        const days: CalendarDay[] = [];
        const today = new Date(currentDate);
        const dayOfWeek = today.getDay();

        // Start from Sunday of the current week
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);

        // Generate 7 days for the week
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dayOfWeek = date.getDay();

            const day: CalendarDay = {
                date: date.getDate(),
                isCurrentMonth: date.getMonth() === currentDate.getMonth(),
                isSelected: selectedDates.includes(date.getDate()) && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear(),
                isToday: date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear(),
                isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            };

            // Map actual availability data to calendar days
            const availability = getAvailabilityForDate(date.getFullYear(), date.getMonth(), date.getDate());
            if (availability) {
                const startDate = new Date(availability.startDate);
                const endDate = new Date(availability.endDate);

                // Use UTC methods to avoid timezone issues
                const startHours = String(startDate.getUTCHours()).padStart(2, '0');
                const startMinutes = String(startDate.getUTCMinutes()).padStart(2, '0');
                const endHours = String(endDate.getUTCHours()).padStart(2, '0');
                const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');

                day.status = "available";
                day.timeRange = `${startHours}:${startMinutes}-${endHours}:${endMinutes}`;
            }
            // TODO: Add booked/blocked status from assignments/blocked dates

            days.push(day);
        }

        return days;
    };

    const calendarDays = useMemo(() => {
        return viewMode === "month" ? generateCalendarDays() : generateWeekDays();
    }, [viewMode, currentDate, selectedDates, availabilitiesData]);

    const handlePreviousMonth = () => {
        if (viewMode === "month") {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else {
            // Previous week
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() - 7);
            setCurrentDate(newDate);
        }
    };

    const handleNextMonth = () => {
        if (viewMode === "month") {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else {
            // Next week
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + 7);
            setCurrentDate(newDate);
        }
    };

    const handleDayClick = (day: CalendarDay) => {
        if (!day.isCurrentMonth) return;

        // Prevent clicking on weekends
        if (day.isWeekend) {
            showErrorToast(
                t("WORKER_AVAILABILITY.TOAST.WEEKEND_TITLE"),
                t("WORKER_AVAILABILITY.TOAST.WEEKEND_DESC")
            );
            return;
        }

        // Check if clicking on a date that already has availability
        const existingAvailability = getAvailabilityForDate(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day.date
        );

        // If date has existing availability, select only this date and load its data
        if (existingAvailability) {
            setSelectedDates([day.date]);
            setSelectedAvailability(existingAvailability);

            // Load the time range from existing availability
            const startDate = new Date(existingAvailability.startDate);
            const endDate = new Date(existingAvailability.endDate);

            const startHours = String(startDate.getUTCHours()).padStart(2, '0');
            const startMinutes = String(startDate.getUTCMinutes()).padStart(2, '0');
            const endHours = String(endDate.getUTCHours()).padStart(2, '0');
            const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');

            setTimeRange({
                start: `${startHours}:${startMinutes}`,
                end: `${endHours}:${endMinutes}`
            });
            setAvailabilityStatus(existingAvailability.status === "blocked" ? "blocked" : "available");
            return;
        }

        // Handle multi-selection for new availabilities (no existing availability)
        const clickedDate = day.date;
        const isAlreadySelected = selectedDates.includes(clickedDate);

        if (isAlreadySelected) {
            // Clicking on an already selected date
            if (selectedDates.length === 1) {
                // If it's the only selected date, deselect it (clear selection)
                // This allows user to start fresh
                return; // Keep it selected, user can click elsewhere to start over
            } else {
                // Deselect the date from multi-selection
                const newSelectedDates = selectedDates.filter(d => d !== clickedDate);
                setSelectedDates(newSelectedDates);
                setSelectedAvailability(null);
            }
        } else {
            // Clicking on a new date (not already selected)
            if (selectedDates.length === 0) {
                // First selection
                setSelectedDates([clickedDate]);
                setSelectedAvailability(null);
            } else {
                // Check if the clicked date is consecutive with existing selections
                const sortedDates = [...selectedDates].sort((a, b) => a - b);
                const minDate = sortedDates[0];
                const maxDate = sortedDates[sortedDates.length - 1];

                // Check if clickedDate is adjacent to the range
                if (clickedDate === minDate - 1 || clickedDate === maxDate + 1) {
                    // Check if the new date would be a weekend
                    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), clickedDate);
                    const newDayOfWeek = newDate.getDay();
                    if (newDayOfWeek === 0 || newDayOfWeek === 6) {
                        showErrorToast(
                            t("WORKER_AVAILABILITY.TOAST.WEEKEND_TITLE"),
                            t("WORKER_AVAILABILITY.TOAST.WEEKEND_DESC")
                        );
                        return;
                    }

                    // Valid: adjacent to existing range and not a weekend
                    setSelectedDates([...selectedDates, clickedDate]);
                    setSelectedAvailability(null);
                } else {
                    // Not consecutive - start over with new date instead of showing error
                    setSelectedDates([clickedDate]);
                    setSelectedAvailability(null);
                }
            }
        }

        // Reset to default values for new availability
        setTimeRange({ start: "08:00", end: "17:00" });
        setTimeSlot("allday");
        setAvailabilityStatus("available");

        // Only open sheet on mobile devices (below lg breakpoint)
        if (window.matchMedia("(max-width: 1023px)").matches) {
            setIsSheetOpen(true);
        }
    };

    const handleTimeSlotChange = (slot: "morning" | "allday" | "afternoon") => {
        setTimeSlot(slot);
        if (slot === "morning") {
            setTimeRange({ start: "08:00", end: "12:00" });
        } else if (slot === "afternoon") {
            setTimeRange({ start: "13:00", end: "17:00" });
        } else {
            setTimeRange({ start: "08:00", end: "17:00" });
        }
    };

    const handleTimeInputChange = (field: "start" | "end", value: string) => {
        setTimeRange(prev => ({ ...prev, [field]: value }));
        // Reset preset selection when manually changing time
        setTimeSlot("allday");
    };

    const handleSaveAvailability = async () => {
        try {
            // Validate that end time is after start time
            const [startHour, startMinute] = timeRange.start.split(':').map(Number);
            const [endHour, endMinute] = timeRange.end.split(':').map(Number);

            const tempStart = new Date(0, 0, 0, startHour, startMinute);
            const tempEnd = new Date(0, 0, 0, endHour, endMinute);

            if (tempEnd <= tempStart) {
                showErrorToast(t("WORKER_AVAILABILITY.TOAST.INVALID_RANGE"), t("WORKER_AVAILABILITY.TOAST.INVALID_RANGE_DESC"));
                return;
            }

            // If updating existing availability
            if (selectedAvailability) {
                const selectedDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDates[0]);

                const startDate = new Date(Date.UTC(
                    selectedDateTime.getFullYear(),
                    selectedDateTime.getMonth(),
                    selectedDateTime.getDate(),
                    startHour,
                    startMinute,
                    0,
                    0
                ));

                const endDate = new Date(Date.UTC(
                    selectedDateTime.getFullYear(),
                    selectedDateTime.getMonth(),
                    selectedDateTime.getDate(),
                    endHour,
                    endMinute,
                    0,
                    0
                ));

                const availabilityData: CreateAvailabilityInput = {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    status: availabilityStatus,
                    isRecurring: false,
                };

                await addAvailability(availabilityData).unwrap();
                const message = availabilityStatus === "blocked"
                    ? t("WORKER_AVAILABILITY.TOAST.SUCCESS_BLOCKING")
                    : t("WORKER_AVAILABILITY.TOAST.SUCCESS_AVAILABILITY");
                showSuccessToast(availabilityStatus === "blocked" ? t("WORKER_AVAILABILITY.TOAST.SUCCESS_BLOCKING") : t("WORKER_AVAILABILITY.TOAST.SUCCESS_AVAILABILITY"), message);

                await refetchAvailabilities();
                return;
            }

            // Create availabilities for all selected dates
            const sortedDates = [...selectedDates].sort((a, b) => a - b);
            let successCount = 0;
            let errorCount = 0;

            for (const date of sortedDates) {
                try {
                    const selectedDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);

                    const startDate = new Date(Date.UTC(
                        selectedDateTime.getFullYear(),
                        selectedDateTime.getMonth(),
                        selectedDateTime.getDate(),
                        startHour,
                        startMinute,
                        0,
                        0
                    ));

                    const endDate = new Date(Date.UTC(
                        selectedDateTime.getFullYear(),
                        selectedDateTime.getMonth(),
                        selectedDateTime.getDate(),
                        endHour,
                        endMinute,
                        0,
                        0
                    ));

                    const availabilityData: CreateAvailabilityInput = {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        status: availabilityStatus,
                        isRecurring: false,
                    };

                    await addAvailability(availabilityData).unwrap();
                    successCount++;
                } catch (error) {
                    errorCount++;
                    console.error(`Failed to save availability for ${date}:`, error);
                }
            }

            if (successCount > 0) {
                const message = availabilityStatus === "blocked"
                    ? t("WORKER_AVAILABILITY.TOAST.SUCCESS_BLOCKING")
                    : t("WORKER_AVAILABILITY.TOAST.SUCCESS_AVAILABILITY");
                showSuccessToast(
                    availabilityStatus === "blocked" ? t("WORKER_AVAILABILITY.TOAST.SUCCESS_BLOCKING") : t("WORKER_AVAILABILITY.TOAST.SUCCESS_AVAILABILITY"),
                    message
                );
            }

            if (errorCount > 0) {
                showErrorToast("Partial failure", `Failed to save ${errorCount} date(s). Please try again.`);
            }

            // Refetch availabilities to update calendar display
            await refetchAvailabilities();

            // Reset selection
            setSelectedDates([new Date().getDate()]);
        } catch (error) {
            showErrorToast(error, "Failed to save availability");
        }
    };

    const handleDeleteAvailability = async () => {
        if (!selectedAvailability?.id) {
            showErrorToast("No availability selected", "Please select a day with existing availability to delete.");
            return;
        }

        try {
            await deleteAvailability(selectedAvailability.id).unwrap();
            showSuccessToast(t("WORKER_AVAILABILITY.TOAST.DELETED"), t("WORKER_AVAILABILITY.TOAST.DELETED_DESC"));

            // Clear selection and reset form
            setSelectedAvailability(null);
            setSelectedDates([new Date().getDate()]);
            setTimeRange({ start: "08:00", end: "17:00" });
            setTimeSlot("allday");

            // Refetch availabilities to update calendar display
            await refetchAvailabilities();
        } catch (error) {
            showErrorToast(error, "Failed to delete availability");
        }
    };

    const handleSyncCalendar = () => {
        // TODO: Implement calendar sync functionality
        showSuccessToast(t("WORKER_AVAILABILITY.TOAST.SYNC"), t("WORKER_AVAILABILITY.TOAST.SYNC_DESC"));
    };

    const getDisplayTitle = () => {
        if (viewMode === "month") {
            return currentDate.toLocaleDateString(i18n.language, { month: "long", year: "numeric" });
        } else {
            // Week view - show week range
            const dayOfWeek = currentDate.getDay();
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - dayOfWeek);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const startMonth = weekStart.toLocaleDateString(i18n.language, { month: "short" });
            const endMonth = weekEnd.toLocaleDateString(i18n.language, { month: "short" });
            const year = weekStart.getFullYear();

            if (startMonth === endMonth) {
                return `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}, ${year}`;
            } else {
                return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${year}`;
            }
        }
    };

    const monthName = useMemo(() => getDisplayTitle(), [viewMode, currentDate]);
    const selectedDayName = useMemo(() => {
        if (selectedDates.length === 0) return "";
        if (selectedDates.length === 1) {
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDates[0]).toLocaleDateString(i18n.language, { weekday: "long" });
        }
        const sortedDates = [...selectedDates].sort((a, b) => a - b);
        return t("WORKER_AVAILABILITY.SELECTED_DAYS_COUNT", { count: sortedDates.length });
    }, [currentDate, selectedDates, i18n.language, t]);

    const selectedDateFormatted = useMemo(() => {
        if (selectedDates.length === 0) return "";
        if (selectedDates.length === 1) {
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDates[0]).toLocaleDateString(i18n.language, { month: "long", day: "numeric", year: "numeric" });
        }
        const sortedDates = [...selectedDates].sort((a, b) => a - b);
        const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), sortedDates[0]);
        const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), sortedDates[sortedDates.length - 1]);
        return `${firstDate.toLocaleDateString(i18n.language, { month: "short", day: "numeric" })} - ${lastDate.toLocaleDateString(i18n.language, { month: "short", day: "numeric", year: "numeric" })}`;
    }, [currentDate, selectedDates, i18n.language]);

    const renderAvailabilityForm = () => (
        <div className="flex flex-col h-full bg-card/50">
            <div className="p-6 border-b border-border flex items-center justify-between bg-card">
                <div>
                    <h3 className="text-foreground text-lg font-bold">{selectedDayName}</h3>
                    <p className="text-primary text-sm font-medium">{selectedDateFormatted}</p>
                    {selectedDates.length > 1 && (
                        <p className="text-muted-foreground text-xs mt-1">
                            {t("WORKER_AVAILABILITY.SELECTED_DAYS_COUNT", { count: selectedDates.length })}
                        </p>
                    )}
                </div>
                <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground border border-border">
                    <Calendar className="h-5 w-5" />
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8">
                {/* Info Banner for Multi-Selection */}
                {!selectedAvailability && (
                    <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-primary font-medium flex-1">
                                {t("WORKER_AVAILABILITY.TIP")}
                            </p>
                            {selectedDates.length > 1 && (
                                <button
                                    onClick={() => setSelectedDates([selectedDates[0]])}
                                    className="text-xs text-primary hover:text-primary/80 font-bold underline whitespace-nowrap"
                                >
                                    {t("WORKER_AVAILABILITY.CLEAR")}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Status Selector */}
                <div className="flex flex-col gap-3">
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                        {t("WORKER_AVAILABILITY.STATUS_LABEL")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setAvailabilityStatus("available")}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                                ${availabilityStatus === "available"
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"}
                            `}
                        >
                            {availabilityStatus === "available" && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
                                </div>
                            )}
                            <div className={`p-2 rounded-full ${availabilityStatus === "available" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            <span className={`font-bold text-sm ${availabilityStatus === "available" ? "text-foreground" : "text-muted-foreground"}`}>{t("WORKER_AVAILABILITY.STATUS_AVAILABLE")}</span>
                        </button>

                        <button
                            onClick={() => setAvailabilityStatus("blocked")}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                                ${availabilityStatus === "blocked"
                                    ? "border-destructive bg-destructive/5 shadow-sm"
                                    : "border-border bg-card hover:border-destructive/50 hover:bg-muted/50"}
                            `}
                        >
                            {availabilityStatus === "blocked" && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-4 w-4 text-destructive fill-destructive/20" />
                                </div>
                            )}
                            <div className={`p-2 rounded-full ${availabilityStatus === "blocked" ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}>
                                <Ban className="h-5 w-5" />
                            </div>
                            <span className={`font-bold text-sm ${availabilityStatus === "blocked" ? "text-foreground" : "text-muted-foreground"}`}>{t("WORKER_AVAILABILITY.STATUS_BLOCKED")}</span>
                        </button>
                    </div>
                </div>

                {availabilityStatus === "available" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Working Hours */}
                        <div className="flex flex-col gap-4">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                {t("WORKER_AVAILABILITY.TIME_SLOT_LABEL")}
                            </label>

                            {/* Preset Slots */}
                            <div className="flex p-1 bg-muted/50 rounded-lg border border-border">
                                <button
                                    onClick={() => handleTimeSlotChange("morning")}
                                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-md transition-all ${timeSlot === "morning" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    {t("WORKER_AVAILABILITY.SLOT_MORNING")}
                                </button>
                                <button
                                    onClick={() => handleTimeSlotChange("allday")}
                                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-md transition-all ${timeSlot === "allday" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    {t("WORKER_AVAILABILITY.SLOT_ALLDAY")}
                                </button>
                                <button
                                    onClick={() => handleTimeSlotChange("afternoon")}
                                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-md transition-all ${timeSlot === "afternoon" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    {t("WORKER_AVAILABILITY.SLOT_AFTERNOON")}
                                </button>
                            </div>

                            {/* Time Range Inputs */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">{t("WORKER_AVAILABILITY.START_LABEL")}</label>
                                    <Input
                                        type="time"
                                        value={timeRange.start}
                                        onChange={(e) => handleTimeInputChange("start", e.target.value)}
                                        className="h-11 bg-background border-border hover:border-primary/50 focus:border-primary focus:ring-primary/20 font-mono text-base"
                                    />
                                </div>
                                <div className="pt-6 text-muted-foreground">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">{t("WORKER_AVAILABILITY.END_LABEL")}</label>
                                    <Input
                                        type="time"
                                        value={timeRange.end}
                                        onChange={(e) => handleTimeInputChange("end", e.target.value)}
                                        className="h-11 bg-background border-border hover:border-primary/50 focus:border-primary focus:ring-primary/20 font-mono text-base"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upcoming Missions */}
                <div className="mt-6 flex flex-col gap-3">
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                        {t("WORKER_AVAILABILITY.UPCOMING_MISSIONS")}
                    </label>
                    {upcomingMissions.length === 0 ? (
                        <div className="p-6 rounded-xl bg-muted/50 border border-border text-center">
                            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-foreground">{t("WORKER_AVAILABILITY.NO_UPCOMING")}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t("WORKER_AVAILABILITY.NO_UPCOMING_DESC")}</p>
                        </div>
                    ) : (
                        upcomingMissions.map((mission) => (
                            <div
                                key={mission.id}
                                className="flex gap-3 p-3 rounded-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] bg-card border border-border hover:border-primary/50 shadow-sm"
                            >
                                <div className="size-10 rounded-full flex items-center justify-center flex-none bg-primary/10 text-primary">
                                    <Stethoscope className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="font-bold text-sm truncate text-foreground">{mission.name}</h4>
                                    <p className="text-xs truncate text-muted-foreground">
                                        {mission.date} • {mission.timeRange}
                                    </p>
                                </div>
                                <button className="ml-auto flex items-center justify-center size-8 rounded-full transition-colors hover:bg-muted text-muted-foreground hover:text-foreground">
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )))}
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-6 space-y-3">
                    <Button
                        onClick={handleSaveAvailability}
                        className={`w-full h-12 font-bold text-base shadow-sm ${availabilityStatus === "blocked"
                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                    >
                        {selectedAvailability
                            ? (availabilityStatus === "blocked" ? t("WORKER_AVAILABILITY.UPDATE_BLOCKED") : t("WORKER_AVAILABILITY.UPDATE_AVAILABILITY"))
                            : (availabilityStatus === "blocked" ? t("WORKER_AVAILABILITY.BLOCK_DAYS") : t("WORKER_AVAILABILITY.SET_AVAILABILITY"))
                        }
                    </Button>

                    {selectedAvailability && (
                        <Button
                            variant="ghost"
                            onClick={handleDeleteAvailability}
                            className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10 font-bold"
                        >
                            {availabilityStatus === "blocked" ? t("WORKER_AVAILABILITY.REMOVE_BLOCKING") : t("WORKER_AVAILABILITY.REMOVE_AVAILABILITY")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex overflow-hidden bg-background">
            {/* Main Calendar Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
                {/* Page Heading & Controls */}
                <div className="flex flex-col gap-6 sm:p-6 lg:p-10 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-foreground font-spline text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                                {t("WORKER_AVAILABILITY.TITLE")}
                            </h1>
                            <p className="text-muted-foreground text-base font-normal">
                                {t("WORKER_AVAILABILITY.SUBTITLE")}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="rounded-full h-10 px-6 font-bold"
                                onClick={handleSyncCalendar}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {t("WORKER_AVAILABILITY.SYNC_CALENDAR")}
                            </Button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        {/* Month Navigation */}
                        <div className="flex items-center gap-4 bg-muted border border-border rounded-full p-1 pl-4 pr-1">
                            <span className="text-foreground text-lg font-bold tabular-nums">{monthName}</span>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-full hover:bg-background text-foreground"
                                    onClick={handlePreviousMonth}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-full hover:bg-background text-foreground"
                                    onClick={handleNextMonth}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div className="flex h-10 items-center justify-center rounded-full bg-muted p-1 border border-border">
                            <label className="flex cursor-pointer h-full items-center justify-center px-6 rounded-full has-checked:bg-background has-checked:shadow-sm has-checked:text-foreground text-muted-foreground has-checked:font-bold text-sm font-medium transition-all">
                                <span>{t("WORKER_AVAILABILITY.MONTH_VIEW")}</span>
                                <input
                                    type="radio"
                                    name="view_mode"
                                    value="month"
                                    checked={viewMode === "month"}
                                    onChange={() => setViewMode("month")}
                                    className="hidden"
                                />
                            </label>
                            <label className="flex cursor-pointer h-full items-center justify-center px-6 rounded-full has-checked:bg-background has-checked:shadow-sm has-checked:text-foreground text-muted-foreground has-checked:font-bold text-sm font-medium transition-all">
                                <span>{t("WORKER_AVAILABILITY.WEEK_VIEW")}</span>
                                <input
                                    type="radio"
                                    name="view_mode"
                                    value="week"
                                    checked={viewMode === "week"}
                                    onChange={() => setViewMode("week")}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 sm:px-6 lg:px-10 pb-10">
                    <div className="w-full h-full min-h-150 flex flex-col rounded-xl overflow-hidden border border-border bg-card shadow-sm">
                        {/* Days Header */}
                        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
                            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                                <div
                                    key={day}
                                    className="py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"
                                >
                                    {t(`WORKER_AVAILABILITY.DAYS.${day}`)}
                                </div>
                            ))}
                        </div>

                        {/* Grid Content */}
                        <div className={`flex-1 grid grid-cols-7 divide-x divide-y divide-border ${viewMode === "month" ? "grid-rows-5" : "grid-rows-1"
                            }`}>
                            {calendarDays.map((day, index) => (
                                <div
                                    key={index}
                                    onClick={() => !day.isWeekend && handleDayClick(day)}
                                    className={`
                                        group relative p-2 min-h-25 transition-colors
                                        ${day.isWeekend ? "bg-muted/30 cursor-not-allowed opacity-50" : "cursor-pointer"}
                                        ${!day.isCurrentMonth ? "bg-muted/20" : day.isWeekend ? "" : "hover:bg-muted/50 bg-card"}
                                        ${day.isSelected && day.isCurrentMonth && day.status !== "blocked" ? "bg-primary/5 ring-1 ring-inset ring-primary z-10" : ""}
                                        ${day.isSelected && day.isCurrentMonth && day.status === "blocked" ? "bg-destructive/10 ring-1 ring-inset ring-destructive z-10" : ""}
                                        ${day.status === "blocked" && day.isCurrentMonth && !day.isSelected ? "bg-destructive/5" : ""}
                                    `}
                                >
                                    {/* Day Number */}
                                    {day.isSelected && day.isCurrentMonth ? (
                                        <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                            {day.date}
                                        </span>
                                    ) : (
                                        <span
                                            className={`font-medium text-sm p-1 ${!day.isCurrentMonth
                                                ? "text-muted-foreground/30"
                                                : day.isWeekend
                                                    ? "text-muted-foreground/50 line-through"
                                                    : day.status === "blocked"
                                                        ? "text-muted-foreground"
                                                        : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                        >
                                            {day.date}
                                        </span>
                                    )}

                                    {/* Day Content */}
                                    {day.isCurrentMonth && day.status === "available" && day.timeRange && (
                                        <div className="mt-1 bg-primary/10 border border-primary/20 rounded px-2 py-1 flex items-center gap-1.5">
                                            <div className="size-1.5 rounded-full bg-primary"></div>
                                            <span className="text-xs font-semibold text-primary truncate">
                                                Avail. {day.timeRange}
                                            </span>
                                        </div>
                                    )}

                                    {day.isCurrentMonth && day.status === "booked" && day.mission && (
                                        <div
                                            className={`mt-1 rounded px-2 py-1 shadow-sm border border-border ${day.mission.color === "purple"
                                                ? "bg-purple-100 dark:bg-purple-900/30 border-l-4 border-l-purple-500"
                                                : "bg-card"
                                                }`}
                                        >
                                            <span className="block text-xs font-bold text-foreground truncate">
                                                {day.mission.name}
                                            </span>
                                            <span className="block text-[10px] text-muted-foreground">{day.mission.time}</span>
                                        </div>
                                    )}

                                    {day.isCurrentMonth && day.status === "blocked" && day.timeRange && (
                                        <div className="mt-1 bg-destructive/10 border border-destructive/20 rounded px-2 py-1 flex items-center gap-1.5">
                                            <Ban className="size-3 text-destructive" />
                                            <span className="text-xs font-semibold text-destructive truncate">
                                                Blocked {day.timeRange}
                                            </span>
                                        </div>
                                    )}

                                    {day.isCurrentMonth && day.status === "blocked" && !day.timeRange && (
                                        <div className="mt-1 flex items-center justify-center">
                                            <Ban className="size-6 text-destructive/40" />
                                        </div>
                                    )}

                                    {day.isSelected && !day.status && day.isCurrentMonth && (
                                        <div className="mt-1">
                                            <p className="text-xs text-muted-foreground text-center mt-2">No status set</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sheet for Editing */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl border-t border-border focus:outline-none">
                    <SheetHeader className="sr-only">
                        <SheetTitle>{t("WORKER_AVAILABILITY.EDIT_SHEET_TITLE")}</SheetTitle>
                    </SheetHeader>
                    {renderAvailabilityForm()}
                </SheetContent>
            </Sheet>

            {/* Right Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-90 flex-none bg-background border-l border-border flex-col shadow-xl z-20">
                {renderAvailabilityForm()}
            </aside>
        </div>
    );
}
