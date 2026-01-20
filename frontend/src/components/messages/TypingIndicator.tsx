import { Loader2 } from "lucide-react";
import type { TypingPayload } from "@/types/socket.types";

interface TypingIndicatorProps {
    typingUsers: TypingPayload[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    if (typingUsers.length === 0) return null;

    const names = typingUsers.map((u) => u.userName);
    const text =
        names.length === 1
            ? `${names[0]} is typing`
            : names.length === 2
                ? `${names[0]} and ${names[1]} are typing`
                : `${names[0]} and ${names.length - 1} others are typing`;

    return (
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="italic">{text}...</span>
        </div>
    );
}
