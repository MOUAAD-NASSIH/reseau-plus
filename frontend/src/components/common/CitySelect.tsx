import { useState, useEffect } from "react";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface CitySelectProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

interface CitiesApiResponse {
    error: boolean;
    msg: string;
    data: string[];
}

// Cache for cities data to avoid refetching
let citiesCache: string[] | null = null;
let isLoadingCache = false;
let isErrorCache = false;

export function CitySelect({
    value,
    onChange,
    placeholder = "Select a city",
    className,
    disabled = false,
}: CitySelectProps) {
    const [open, setOpen] = useState(false);
    const [cities, setCities] = useState<string[]>(citiesCache || []);
    const [isLoading, setIsLoading] = useState(!citiesCache && !isLoadingCache);
    const [isError, setIsError] = useState(isErrorCache);

    // Fetch Moroccan cities from the geography API
    useEffect(() => {
        if (citiesCache) {
            setCities(citiesCache);
            setIsLoading(false);
            return;
        }

        if (isLoadingCache) return;

        const fetchCities = async () => {
            try {
                setIsLoading(true);
                isLoadingCache = true;

                const response = await axios.post<CitiesApiResponse>(
                    "https://countriesnow.space/api/v0.1/countries/cities",
                    { country: "Morocco" }
                );

                if (response.data.error) {
                    throw new Error(response.data.msg);
                }

                // Sort cities alphabetically
                const sortedCities = response.data.data.sort((a, b) =>
                    a.localeCompare(b)
                );
                citiesCache = sortedCities;
                setCities(sortedCities);
                setIsError(false);
                isErrorCache = false;
            } catch (err) {
                console.error("Failed to fetch cities:", err);
                setIsError(true);
                isErrorCache = true;
            } finally {
                setIsLoading(false);
                isLoadingCache = false;
            }
        };

        fetchCities();
    }, []);



    if (isLoading) {
        return <Skeleton className={cn("h-10 w-full", className)} />;
    }

    if (isError || (!cities.length && !isLoading)) {
        return (
            <div className={cn("relative", className)}>
                <Button
                    variant="outline"
                    className="w-full justify-between text-destructive"
                    disabled
                >
                    Error loading cities
                </Button>
            </div>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    {value ? value : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                            {cities.map((city) => (
                                <CommandItem
                                    key={city}
                                    value={city}
                                    onSelect={(currentValue) => {
                                        // Start case insensitivity workarounds for cmdk if needed, 
                                        // but here we just use the city name directly as value
                                        onChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === city ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {city}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

