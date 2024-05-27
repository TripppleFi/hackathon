import React from "react"
import { Pressable, View } from "react-native"
import { cva, type VariantProps } from "class-variance-authority"
import { Skeleton } from "moti/skeleton"

import { TextClassProvider } from "@/components/text"
import { type PressableRef } from "@/components/types"
import { cn } from "@/lib/utils"

const buttonVariants = cva("flex-row items-center justify-center rounded-md", {
  variants: {
    variant: {
      default: "bg-primary shadow active:bg-primary/90",
      outline:
        "border border-foreground/30 bg-background shadow-sm active:bg-accent",
      secondary:
        "border border-input bg-secondary shadow-sm active:bg-secondary/80",
      ghost: "active:bg-accent",
    },
    size: {
      default: "h-12 px-4 gap-x-1",
      sm: "h-8 px-3 gap-x-1",
      lg: "h-16 px-8 gap-x-1",
      icon: "h-12 w-12 gap-x-1",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

const buttonTextVariants = cva("font-uiBold uppercase", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      outline: "text-foreground active:text-accent-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground active:text-accent-foreground",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-xl",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof buttonVariants> & { isPending?: boolean }

const Button = React.forwardRef<PressableRef, ButtonProps>(
  ({ className, variant = "default", size, isPending, ...props }, ref) => {
    if (isPending) {
      return (
        <Skeleton show>
          <View
            className={cn(
              buttonVariants({ variant, size, className }),
              "ml-0 rounded-full bg-transparent px-0",
            )}
          />
        </Skeleton>
      )
    }

    return (
      <TextClassProvider value={buttonTextVariants({ variant, size })}>
        <Pressable
          ref={ref}
          role="button"
          className={cn(
            props.disabled && "opacity-50",
            buttonVariants({ variant, size, className }),
          )}
          {...props}
        />
      </TextClassProvider>
    )
  },
)

export { Button, buttonVariants, buttonTextVariants, type ButtonProps }
