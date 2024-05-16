import * as React from "react"
import { TextInput } from "react-native"

import { cn } from "@/lib/utils"

export type InputProps = React.ComponentPropsWithoutRef<typeof TextInput>

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        {...props}
        textAlignVertical={props.multiline ? "top" : "center"}
        className={cn(
          "border-primary/20 min-h-12 bg-background w-full rounded-md border px-3 py-1 text-base shadow-sm",
          className,
        )}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
