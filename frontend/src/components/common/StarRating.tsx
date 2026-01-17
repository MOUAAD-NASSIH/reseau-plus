import { Star } from "lucide-react";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: string;
}

export function StarRating({
    value,
    onChange,
    readonly = false,
    size = "h-6 w-6"
}: StarRatingProps) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
                >
                    <Star
                        className={`${size} ${star <= value
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}
