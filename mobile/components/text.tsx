import React from "react"
import { Text as RNText } from "react-native"

import { Text as SlotText } from "@/components/slot"
import { type SlottableTextProps, type TextRef } from "@/components/types"
import { cn } from "@/lib/utils"

const TextClassContext = React.createContext<string | undefined>(undefined)

const Text = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const textClass = React.useContext(TextClassContext)
    const Component = asChild ? SlotText : RNText
    return (
      <Component
        className={cn(
          "font-ui400 text-foreground text-base",
          textClass,
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

export { Text, TextClassContext }
