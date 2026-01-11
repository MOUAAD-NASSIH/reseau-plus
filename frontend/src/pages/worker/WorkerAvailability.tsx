import { useState, useMemo } from "react";
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
    Users,
} from "lucide-react";
import {
    useGetWorkerAvailabilitiesQuery,
    useAddAvailabilityMutation,
    useDeleteAvailabilityMutation,
} from "@/features/api/endpoints/workerEndpoints";
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

interface Mission {
    id: string;
    name: string;
    date: string;
    timeRange: string;
    icon: "hospital" | "community";
    color: string;
}

export default function WorkerAvailability() {
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
                    date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    timeRange: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
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
                "Weekend not available",
                "You cannot set availability for weekends (Saturday and Sunday)."
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
                            "Weekend not available",
                            "You cannot include weekends in your availability range."
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

    // Calculate slider position based on time (assuming 24-hour day, 00:00 to 24:00)
    const getSliderPosition = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes;
        // Map 0-24 hours to 0-100%
        return (totalMinutes / (24 * 60)) * 100;
    };

    const startPosition = useMemo(() => getSliderPosition(timeRange.start), [timeRange.start]);
    const endPosition = useMemo(() => getSliderPosition(timeRange.end), [timeRange.end]);

    const handleSaveAvailability = async () => {
        try {
            // Validate that end time is after start time
            const [startHour, startMinute] = timeRange.start.split(':').map(Number);
            const [endHour, endMinute] = timeRange.end.split(':').map(Number);
            
            const tempStart = new Date(0, 0, 0, startHour, startMinute);
            const tempEnd = new Date(0, 0, 0, endHour, endMinute);
            
            if (tempEnd <= tempStart) {
                showErrorToast("Invalid time range", "End time must be after start time.");
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
                    ? "Your blocking has been updated successfully." 
                    : "Your availability has been updated successfully.";
                showSuccessToast(availabilityStatus === "blocked" ? "Blocking updated" : "Availability updated", message);
                
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
                    ? `${successCount} day(s) blocked successfully.` 
                    : `${successCount} day(s) marked as available successfully.`;
                showSuccessToast(
                    availabilityStatus === "blocked" ? "Blocking saved" : "Availability saved", 
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
            showSuccessToast("Availability deleted", "Your availability has been removed.");
            
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
        showSuccessToast("Syncing calendar", "Your calendar is being synchronized...");
    };

    const getDisplayTitle = () => {
        if (viewMode === "month") {
            return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        } else {
            // Week view - show week range
            const dayOfWeek = currentDate.getDay();
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - dayOfWeek);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
            const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
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
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDates[0]).toLocaleDateString("en-US", { weekday: "long" });
        }
        const sortedDates = [...selectedDates].sort((a, b) => a - b);
        return `${sortedDates.length} consecutive days`;
    }, [currentDate, selectedDates]);
    
    const selectedDateFormatted = useMemo(() => {
        if (selectedDates.length === 0) return "";
        if (selectedDates.length === 1) {
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDates[0]).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        }
        const sortedDates = [...selectedDates].sort((a, b) => a - b);
        const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), sortedDates[0]);
        const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), sortedDates[sortedDates.length - 1]);
        return `${firstDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }, [currentDate, selectedDates]);

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Main Calendar Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background-dark">
                {/* Page Heading & Controls */}
                <div className="flex flex-col gap-6 p-6 lg:p-10 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-white text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
                                My Availability
                            </h1>
                            <p className="text-text-muted text-base font-normal">
                                Manage your schedule and mission capacity for upcoming assignments.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                className="rounded-full h-10 px-6 bg-border-dark hover:bg-[#326747] text-white text-sm font-bold"
                                onClick={handleSyncCalendar}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sync Calendar
                            </Button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        {/* Month Navigation */}
                        <div className="flex items-center gap-4 bg-surface-dark border border-border-dark rounded-full p-1 pl-4 pr-1">
                            <span className="text-white text-lg font-bold tabular-nums">{monthName}</span>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-full hover:bg-border-dark text-white"
                                    onClick={handlePreviousMonth}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-full hover:bg-border-dark text-white"
                                    onClick={handleNextMonth}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div className="flex h-10 items-center justify-center rounded-full bg-border-dark p-1">
                            <label className="flex cursor-pointer h-full items-center justify-center px-6 rounded-full has-checked:bg-surface-darker has-checked:shadow-sm has-checked:text-white text-text-muted text-sm font-medium transition-all">
                                <span>Month View</span>
                                <input
                                    type="radio"
                                    name="view_mode"
                                    value="month"
                                    checked={viewMode === "month"}
                                    onChange={() => setViewMode("month")}
                                    className="hidden"
                                />
                            </label>
                            <label className="flex cursor-pointer h-full items-center justify-center px-6 rounded-full has-checked:bg-surface-darker has-checked:shadow-sm has-checked:text-white text-text-muted text-sm font-medium transition-all">
                                <span>Week View</span>
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
                <div className="flex-1 px-6 lg:px-10 pb-10">
                    <div className="w-full h-full min-h-150 flex flex-col rounded-xl overflow-hidden border border-border-dark bg-surface-darker">
                        {/* Days Header */}
                        <div className="grid grid-cols-7 border-b border-border-dark bg-surface-dark">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div
                                    key={day}
                                    className="py-3 text-center text-xs font-bold uppercase tracking-wider text-text-muted"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid Content */}
                        <div className={`flex-1 grid grid-cols-7 divide-x divide-y divide-border-dark ${
                            viewMode === "month" ? "grid-rows-5" : "grid-rows-1"
                        }`}>
                            {calendarDays.map((day, index) => (
                                <div
                                    key={index}
                                    onClick={() => !day.isWeekend && handleDayClick(day)}
                                    className={`
                                        group relative p-2 min-h-25 transition-colors
                                        ${day.isWeekend ? "bg-surface-dark/20 cursor-not-allowed opacity-50" : "cursor-pointer"}
                                        ${!day.isCurrentMonth ? "bg-surface-dark/30" : day.isWeekend ? "" : "hover:bg-surface-dark"}
                                        ${day.isSelected && day.isCurrentMonth && day.status !== "blocked" ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""}
                                        ${day.isSelected && day.isCurrentMonth && day.status === "blocked" ? "bg-red-900/20 ring-1 ring-inset ring-red-600" : ""}
                                        ${day.status === "blocked" && day.isCurrentMonth && !day.isSelected ? "bg-red-950/40 border border-red-900/30" : ""}
                                    `}
                                >
                                    {/* Day Number */}
                                    {day.isSelected && day.isCurrentMonth ? (
                                        <span className="flex items-center justify-center size-6 rounded-full bg-primary text-background-dark font-bold text-sm">
                                            {day.date}
                                        </span>
                                    ) : (
                                        <span
                                            className={`font-medium text-sm p-1 ${
                                                !day.isCurrentMonth
                                                    ? "text-text-muted/30"
                                                    : day.isWeekend
                                                    ? "text-text-muted/30 line-through"
                                                    : day.status === "blocked"
                                                    ? "text-text-muted/50"
                                                    : "text-text-muted group-hover:text-white"
                                            }`}
                                        >
                                            {day.date}
                                        </span>
                                    )}

                                    {/* Day Content */}
                                    {day.isCurrentMonth && day.status === "available" && day.timeRange && (
                                        <div className="mt-1 bg-primary/20 border border-primary/30 rounded px-2 py-1 flex items-center gap-1.5">
                                            <div className="size-1.5 rounded-full bg-primary"></div>
                                            <span className="text-xs font-semibold text-primary truncate">
                                                Available {day.timeRange}
                                            </span>
                                        </div>
                                    )}

                                    {day.isCurrentMonth && day.status === "booked" && day.mission && (
                                        <div
                                            className={`mt-1 rounded px-2 py-1 shadow-sm ${
                                                day.mission.color === "purple"
                                                    ? "bg-white border-l-4 border-purple-500"
                                                    : "bg-white"
                                            }`}
                                        >
                                            <span className="block text-xs font-bold text-background-dark truncate">
                                                {day.mission.name}
                                            </span>
                                            <span className="block text-[10px] text-gray-500">{day.mission.time}</span>
                                        </div>
                                    )}

                                    {day.isCurrentMonth && day.status === "blocked" && day.timeRange && (
                                        <div className="mt-1 bg-red-900/30 border border-red-800/50 rounded px-2 py-1 flex items-center gap-1.5">
                                            <Ban className="size-3 text-red-400" />
                                            <span className="text-xs font-semibold text-red-400 truncate">
                                                Blocked {day.timeRange}
                                            </span>
                                        </div>
                                    )}

                                    {day.isCurrentMonth && day.status === "blocked" && !day.timeRange && (
                                        <div className="mt-1 flex items-center justify-center">
                                            <Ban className="size-6 text-red-500/70" />
                                        </div>
                                    )}

                                    {day.isSelected && !day.status && day.isCurrentMonth && (
                                        <div className="mt-1">
                                            <p className="text-xs text-text-muted text-center mt-2">No status set</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="w-90 flex-none bg-surface-darker border-l border-border-dark flex flex-col shadow-2xl">
                <div className="p-6 border-b border-border-dark flex items-center justify-between">
                    <div>
                        <h3 className="text-white text-lg font-bold">{selectedDayName}</h3>
                        <p className="text-primary text-sm font-medium">{selectedDateFormatted}</p>
                        {selectedDates.length > 1 && (
                            <p className="text-text-muted text-xs mt-1">
                                {selectedDates.length} consecutive days selected
                            </p>
                        )}
                    </div>
                    <div className="size-10 rounded-full bg-surface-dark flex items-center justify-center text-white border border-border-dark">
                        <Calendar className="h-5 w-5" />
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8">
                    {/* Info Banner for Multi-Selection */}
                    {!selectedAvailability && (
                        <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-xs text-primary font-medium flex-1">
                                    💡 Tip: Click on multiple consecutive dates to set availability for a range. Dates must be in sequence without gaps.
                                </p>
                                {selectedDates.length > 1 && (
                                    <button
                                        onClick={() => setSelectedDates([selectedDates[0]])}
                                        className="text-xs text-primary hover:text-primary/80 font-bold underline whitespace-nowrap"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Status Selector */}
                    <div className="flex flex-col gap-3">
                        <label className="text-text-muted text-xs font-bold uppercase tracking-wider">
                            Availability Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="cursor-pointer group">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={availabilityStatus === "available"}
                                    onChange={() => setAvailabilityStatus("available")}
                                    className="peer hidden"
                                />
                                <div className="h-20 rounded-xl border-2 border-border-dark bg-surface-dark p-3 flex flex-col items-center justify-center gap-2 peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
                                    <CheckCircle2 className="h-5 w-5 text-text-muted peer-checked:text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold text-white">Available</span>
                                </div>
                            </label>
                            <label className="cursor-pointer group">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={availabilityStatus === "blocked"}
                                    onChange={() => setAvailabilityStatus("blocked")}
                                    className="peer hidden"
                                />
                                <div className="h-20 rounded-xl border-2 border-border-dark bg-surface-dark p-3 flex flex-col items-center justify-center gap-2 peer-checked:border-red-400 peer-checked:bg-red-400/10 transition-all">
                                    <Ban className="h-5 w-5 text-text-muted peer-checked:text-red-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold text-white">Blocked</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Time Slider Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <label className="text-text-muted text-xs font-bold uppercase tracking-wider">
                                Time Slots
                            </label>
                            <button
                                className="text-primary text-xs font-bold hover:underline"
                                onClick={() => {
                                    setTimeRange({ start: "08:00", end: "17:00" });
                                    setTimeSlot("allday");
                                }}
                            >
                                Reset
                            </button>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-dark border border-border-dark space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs text-text-muted font-medium">Start Time</label>
                                    <Input
                                        type="time"
                                        value={timeRange.start}
                                        onChange={(e) => handleTimeInputChange("start", e.target.value)}
                                        className="bg-surface-darker border-border-dark text-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs text-text-muted font-medium">End Time</label>
                                    <Input
                                        type="time"
                                        value={timeRange.end}
                                        onChange={(e) => handleTimeInputChange("end", e.target.value)}
                                        className="bg-surface-darker border-border-dark text-white"
                                    />
                                </div>
                            </div>
                            {/* Range Slider Visualization */}
                            <div className="relative h-2 bg-[#234832] rounded-full w-full">
                                <div 
                                    className="absolute top-0 bottom-0 bg-primary rounded-full"
                                    style={{
                                        left: `${startPosition}%`,
                                        right: `${100 - endPosition}%`
                                    }}
                                ></div>
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 size-4 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
                                    style={{ left: `${startPosition}%`, transform: 'translate(-50%, -50%)' }}
                                ></div>
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 size-4 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
                                    style={{ left: `${endPosition}%`, transform: 'translate(-50%, -50%)' }}
                                ></div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleTimeSlotChange("morning")}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        timeSlot === "morning"
                                            ? "bg-primary text-background-dark font-bold border-primary"
                                            : "bg-surface-darker text-text-muted hover:text-white border-transparent hover:border-border-dark"
                                    }`}
                                >
                                    Morning
                                </button>
                                <button
                                    onClick={() => handleTimeSlotChange("allday")}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        timeSlot === "allday"
                                            ? "bg-primary text-background-dark font-bold border-primary"
                                            : "bg-surface-darker text-text-muted hover:text-white border-transparent hover:border-border-dark"
                                    }`}
                                >
                                    All Day
                                </button>
                                <button
                                    onClick={() => handleTimeSlotChange("afternoon")}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        timeSlot === "afternoon"
                                            ? "bg-primary text-background-dark font-bold border-primary"
                                            : "bg-surface-darker text-text-muted hover:text-white border-transparent hover:border-border-dark"
                                    }`}
                                >
                                    Afternoon
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Missions */}
                    <div className="flex flex-col gap-3">
                        <label className="text-text-muted text-xs font-bold uppercase tracking-wider">
                            Upcoming Missions
                        </label>
                        {upcomingMissions.length === 0 ? (
                            <div className="p-6 rounded-xl bg-surface-dark border border-border-dark text-center">
                                <Calendar className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                                <p className="text-sm text-text-muted">No upcoming missions</p>
                                <p className="text-xs text-text-muted/70 mt-1">Your confirmed missions will appear here</p>
                            </div>
                        ) : (
                            upcomingMissions.map((mission) => (
                            <div
                                key={mission.id}
                                className="flex gap-3 p-3 rounded-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] bg-[#234832] text-white border border-[#326747]"
                            >
                                <div className="size-10 rounded-full flex items-center justify-center flex-none bg-[#326747]">
                                    <Stethoscope className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="font-bold text-sm truncate">{mission.name}</h4>
                                    <p className="text-xs truncate text-text-muted">
                                        {mission.date} • {mission.timeRange}
                                    </p>
                                </div>
                                <button className="ml-auto flex items-center justify-center size-8 rounded-full transition-colors hover:bg-white/10 text-text-muted hover:text-white">
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-4 border-t border-border-dark bg-surface-darker">
                    {selectedAvailability ? (
                        <div className="space-y-3">
                            <div className="text-xs text-text-muted text-center mb-2">
                                {selectedAvailability.status === "blocked" ? "Blocked" : "Available"} time exists for this day. You can update or remove it.
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={handleDeleteAvailability}
                                    variant="destructive"
                                    className="w-full h-12 rounded-full text-base font-bold"
                                >
                                    Remove
                                </Button>
                                <Button
                                    onClick={handleSaveAvailability}
                                    className={`w-full h-12 rounded-full text-base font-bold transition-all ${
                                        availabilityStatus === "blocked"
                                            ? "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                                            : "bg-primary hover:bg-[#20bd5e] text-background-dark shadow-[0_0_15px_rgba(43,238,121,0.2)]"
                                    }`}
                                >
                                    {availabilityStatus === "blocked" ? "Update to Blocked" : "Update to Available"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={handleSaveAvailability}
                            className={`w-full h-12 rounded-full text-base font-bold transition-all ${
                                availabilityStatus === "blocked"
                                    ? "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                                    : "bg-primary hover:bg-[#20bd5e] text-background-dark shadow-[0_0_15px_rgba(43,238,121,0.2)]"
                            }`}
                        >
                            {availabilityStatus === "blocked" ? "Save Blocking" : "Save Availability"}
                        </Button>
                    )}
                </div>
            </aside>
        </div>
    );
}

