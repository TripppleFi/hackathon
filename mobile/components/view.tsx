import React from "react"
import { View as RNView, type ViewProps } from "react-native"

import { type ViewRef } from "@/components/types"
import { cn } from "@/lib/utils"

const Container = createComponent("font-uiRegular text-base")

function createComponent(classes: string) {
  return React.forwardRef<ViewRef, ViewProps>(
    ({ className, ...props }, ref) => {
      return (
        <RNView
          className={cn("text-foreground px-8", classes, className)}
          ref={ref}
          {...props}
        />
      )
    },
  )
}

export { Container }
