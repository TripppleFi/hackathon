import React from "react"
import { Text as RNText } from "react-native"

import { Text as SlotText } from "@/components/slot"
import { type SlottableTextProps, type TextRef } from "@/components/types"
import { cn } from "@/lib/utils"

const TextClassContext = React.createContext<string | undefined>(undefined)
const TextClassProvider = TextClassContext.Provider

const Text = createTextComponent("font-uiRegular text-base")
const Heading = createTextComponent("font-uiBold text-3xl")
const Subheading = createTextComponent("font-uiMedium text-lg uppercase")
const Label = createTextComponent(
  "font-uiBold text-xs uppercase text-muted-foreground",
)

function createTextComponent(classes: string) {
  return React.forwardRef<TextRef, SlottableTextProps>(
    ({ className, asChild = false, ...props }, ref) => {
      const textClass = React.useContext(TextClassContext)
      const Component = asChild ? SlotText : RNText
      return (
        <Component
          className={cn("text-foreground", classes, textClass, className)}
          ref={ref}
          {...props}
        />
      )
    },
  )
}

export { Text, Heading, Label, Subheading, TextClassProvider }
