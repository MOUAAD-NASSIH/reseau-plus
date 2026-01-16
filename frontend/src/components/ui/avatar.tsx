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
 * Generate a consistent background color based on the name
 * This ensures the same name always gets the same color
 */
function getColorFromName(name: string): string {
  const colors = [
    "bg-red-500/20 text-red-700 dark:text-red-300",
    "bg-orange-500/20 text-orange-700 dark:text-orange-300",
    "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
    "bg-lime-500/20 text-lime-700 dark:text-lime-300",
    "bg-green-500/20 text-green-700 dark:text-green-300",
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    "bg-teal-500/20 text-teal-700 dark:text-teal-300",
    "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
    "bg-sky-500/20 text-sky-700 dark:text-sky-300",
    "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    "bg-violet-500/20 text-violet-700 dark:text-violet-300",
    "bg-purple-500/20 text-purple-700 dark:text-purple-300",
    "bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300",
    "bg-pink-500/20 text-pink-700 dark:text-pink-300",
    "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/**
 * UserAvatar - Convenience component that combines Avatar with automatic initials fallback
 */
interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string | null
  name: string
  alt?: string
  className?: string
}

function UserAvatar({ src, name, size, alt, className }: UserAvatarProps) {
  const initials = React.useMemo(() => getInitials(name), [name])
  const colorClass = React.useMemo(() => getColorFromName(name), [name])
  const altText = alt || name || "User avatar"

  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={altText} />}
      <AvatarFallback className={colorClass}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, avatarVariants }
