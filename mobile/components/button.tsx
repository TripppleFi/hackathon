import React from "react"
import { Pressable } from "react-native"
import { cva, type VariantProps } from "class-variance-authority"

import { TextClassContext } from "@/components/text"
import { type PressableRef } from "@/components/types"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary shadow",
      },
      size: {
        default: "h-12 px-4",
        sm: "h-8 px-3",
        lg: "h-16 px-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const buttonTextVariants = cva("", {
  variants: {
    variant: {
      default: "text-primary-foreground",
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
  VariantProps<typeof buttonVariants>

const Button = React.forwardRef<PressableRef, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
        <Pressable
          ref={ref}
          role="button"
          className={cn(
            props.disabled && "opacity-50",
            buttonVariants({ variant, size, className }),
          )}
          {...props}
        />
      </TextClassContext.Provider>
    )
  },
)

export { Button, buttonVariants, buttonTextVariants, type ButtonProps }
