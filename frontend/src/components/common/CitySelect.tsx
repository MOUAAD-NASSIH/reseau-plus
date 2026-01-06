import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface CitySelectProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

interface CitiesApiResponse {
    error: boolean;
    msg: string;
    data: string[];
}

// Cache for cities data to avoid refetching
let citiesCache: string[] | null = null;

export function CitySelect({ value, onChange, placeholder = "Select a city" }: CitySelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [cities, setCities] = useState<string[]>(citiesCache || []);
    const [isLoading, setIsLoading] = useState(!citiesCache);
    const [isError, setIsError] = useState(false);

    // Fetch Moroccan cities from the geography API
    useEffect(() => {
        if (citiesCache) {
            setCities(citiesCache);
            setIsLoading(false);
            return;
        }

        const fetchCities = async () => {
            try {
                setIsLoading(true);
                const response = await axios.post<CitiesApiResponse>(
                    "https://countriesnow.space/api/v0.1/countries/cities",
                    { country: "Morocco" }
                );

                if (response.data.error) {
                    throw new Error(response.data.msg);
                }

                // Sort cities alphabetically
                const sortedCities = response.data.data.sort((a, b) => a.localeCompare(b));
                citiesCache = sortedCities;
                setCities(sortedCities);
                setIsError(false);
            } catch {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCities();
    }, []);

    // Filter cities based on search
    const filteredCities = useMemo(() => {
        if (!cities) return [];
        if (!search.trim()) return cities;

        const searchLower = search.toLowerCase().trim();
        return cities.filter(city =>
            city.toLowerCase().includes(searchLower)
        );
    }, [cities, search]);

    const handleSelect = (city: string) => {
        onChange(city);
        setOpen(false);
        setSearch("");
    };

    if (isLoading) {
        return <Skeleton className="h-12 w-full" />;
    }

    if (isError || !cities.length) {
        return (
            <Button
                variant="outline"
                className="h-12 w-full justify-between text-muted-foreground"
                disabled
            >
                Failed to load cities
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        );
    }

    return (
        <div className="relative">
            <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="h-12 w-full justify-between"
                onClick={() => setOpen(!open)}
            >
                <span className={cn(!value && "text-muted-foreground")}>
                    {value || placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <>
                    {/* Backdrop to close dropdown */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setOpen(false);
                            setSearch("");
                        }}
                    />

                    {/* Dropdown */}
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                        {/* Search input */}
                        <div className="flex items-center border-b px-3 py-2">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Input
                                placeholder="Search city..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                autoFocus
                            />
                        </div>

                        {/* Cities list */}
                        <div className="max-h-60 overflow-y-auto p-1">
                            {filteredCities.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No city found.
                                </p>
                            ) : (
                                filteredCities.map((city) => (
                                    <button
                                        key={city}
                                        type="button"
                                        className={cn(
                                            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none",
                                            "hover:bg-primary/10 hover:text-foreground",
                                            "focus:bg-primary/10 focus:text-foreground",
                                            value === city && "bg-primary/10"
                                        )}
                                        onClick={() => handleSelect(city)}
                                    >
                                        <Check
                                            className={cn(
                                                "absolute left-2 h-4 w-4",
                                                value === city ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {city}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

