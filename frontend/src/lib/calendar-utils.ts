/**
 * Calendar Utility Functions
 * Helpers for the AvailabilityCalendar component
 * Requirements: 9.5, 9.18
 */

import type { WorkerAvailability } from "@/types/auth.types";

/**
 * Calendar event representation for react-big-calendar
 */
export interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    isRecurring: boolean;
    isPast: boolean;
    resource?: WorkerAvailability;
}

/**
 * Maps a WorkerAvailability to a CalendarEvent
 * Preserves timezone handling from the original date strings
 * 
 * @param availability - The worker availability record
 * @returns CalendarEvent for react-big-calendar
 */
export function mapAvailabilityToEvent(availability: WorkerAvailability): CalendarEvent {
    const now = new Date();
    const startDate = parseDate(availability.startDate);
    const endDate = parseDate(availability.endDate);
    const isPast = endDate < now;

    return {
        id: availability.id,
        title: availability.isRecurring ? "Available (Recurring)" : "Available",
        start: startDate,
        end: endDate,
        isRecurring: availability.isRecurring,
        isPast,
        resource: availability,
    };
}

/**
 * Maps an array of WorkerAvailability to CalendarEvents
 * 
 * @param availabilities - Array of worker availability records
 * @returns Array of CalendarEvents
 */
export function mapAvailabilitiesToEvents(availabilities: WorkerAvailability[]): CalendarEvent[] {
    return availabilities.map(mapAvailabilityToEvent);
}

/**
 * Time slot for overlap checking
 */
export interface TimeSlot {
    start: Date;
    end: Date;
    id?: number; // Optional ID to exclude self when editing
}

/**
 * Checks if a new time slot overlaps with any existing slots
 * Used to prevent creation of overlapping availability slots
 * 
 * @param newSlot - The new slot being created/updated
 * @param existingSlots - Array of existing calendar events
 * @returns true if there is an overlap, false otherwise
 */
export function checkOverlap(
    newSlot: TimeSlot,
    existingSlots: CalendarEvent[]
): boolean {
    return existingSlots.some((slot) => {
        // Skip past slots - they don't matter for overlap
        if (slot.isPast) return false;

        // Skip self when editing (if id is provided)
        if (newSlot.id !== undefined && slot.id === newSlot.id) return false;

        // Check for overlap:
        // Two ranges overlap if one starts before the other ends AND ends after the other starts
        const overlaps = newSlot.start < slot.end && newSlot.end > slot.start;

        return overlaps;
    });
}

/**
 * Parses a date string to a Date object
 * Handles ISO strings and date-only strings consistently
 * 
 * @param dateString - Date string (ISO format or YYYY-MM-DD)
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
    // If it's a date-only string (YYYY-MM-DD), parse it as local time
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }
    // Otherwise parse as ISO string
    return new Date(dateString);
}

/**
 * Formats a Date to a date string for form inputs (YYYY-MM-DD)
 * 
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Formats a Date to a display string
 * 
 * @param date - Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Formats a Date to include time for tooltips
 * 
 * @param date - Date object
 * @returns Formatted date-time string
 */
export function formatDateTimeForTooltip(date: Date): string {
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Gets the start of day for a given date
 * 
 * @param date - Date object
 * @returns Date object set to start of day (00:00:00)
 */
export function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Gets the end of day for a given date
 * 
 * @param date - Date object
 * @returns Date object set to end of day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}

/**
 * Checks if a date is in the past
 * 
 * @param date - Date to check
 * @returns true if the date is before today
 */
export function isPastDate(date: Date): boolean {
    const today = startOfDay(new Date());
    return date < today;
}

/**
 * Creates a default end date from a start date (same day)
 * 
 * @param startDate - Start date
 * @returns End date (same day)
 */
export function getDefaultEndDate(startDate: Date): Date {
    return new Date(startDate);
}
