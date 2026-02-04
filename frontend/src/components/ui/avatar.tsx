"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
        xl: "size-16",
        "2xl": "size-24",
        "3xl": "size-32",
        "4xl": "size-40",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

function Avatar({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
        className
      )}
      {...props}
    />
  )
}

/**
 * Extract initials from a name string
 * Handles various name formats:
 * - "John Doe" -> "JD"
 * - "John" -> "J"
 * - "John Middle Doe" -> "JD" (first and last)
 * - "" or whitespace -> "?"
 */
// eslint-disable-next-line react-refresh/only-export-components
export function getInitials(name: string): string {
  if (!name || typeof name !== "string") {
    return "?"
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return "?"
  }

  const parts = trimmedName.split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  const firstInitial = parts[0].charAt(0).toUpperCase()
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()

  return `${firstInitial}${lastInitial}`
}

/**
 * UserAvatar - Convenience component that combines Avatar with automatic initials fallback
 */
interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string | null
  name?: string | null
  alt?: string
  className?: string
  fallbackIcon?: React.ReactNode
}

function UserAvatar({ src, name, size, alt, className, fallbackIcon }: UserAvatarProps) {
  const initials = React.useMemo(() => getInitials(name || ""), [name])
  const altText = alt || name || "User avatar"

  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={altText} />}
      <AvatarFallback className="bg-muted text-muted-foreground font-medium uppercase">
        {fallbackIcon || initials}
      </AvatarFallback>
    </Avatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, avatarVariants }
