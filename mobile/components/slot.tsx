import React from "react"
import {
  Pressable as RNPressable,
  Text as RNText,
  View as RNView,
  StyleSheet,
  type PressableStateCallbackType,
  type ImageStyle as RNImageStyle,
  type PressableProps as RNPressableProps,
  type TextProps as RNTextProps,
  type ViewProps as RNViewProps,
  type StyleProp,
} from "react-native"

import {
  type PressableRef,
  type TextRef,
  type ViewRef,
} from "@/components/types"

const Pressable = React.forwardRef<PressableRef, RNPressableProps>(
  (props, forwardedRef) => {
    const { children, ...pressableSlotProps } = props

    if (!React.isValidElement(children)) {
      console.log("Slot.Pressable - Invalid asChild element", children)
      return null
    }

    return React.cloneElement<
      React.ComponentPropsWithoutRef<typeof RNPressable>,
      PressableRef
    >(isTextChildren(children) ? <></> : children, {
      ...mergeProps(pressableSlotProps, children.props),
      ref: forwardedRef
        ? composeRefs(forwardedRef, (children as any).ref)
        : (children as any).ref,
    })
  },
)

const View = React.forwardRef<ViewRef, RNViewProps>((props, forwardedRef) => {
  const { children, ...viewSlotProps } = props

  if (!React.isValidElement(children)) {
    console.log("Slot.View - Invalid asChild element", children)
    return null
  }

  return React.cloneElement<
    React.ComponentPropsWithoutRef<typeof RNView>,
    ViewRef
  >(isTextChildren(children) ? <></> : children, {
    ...mergeProps(viewSlotProps, children.props),
    ref: forwardedRef
      ? composeRefs(forwardedRef, (children as any).ref)
      : (children as any).ref,
  })
})

const Text = React.forwardRef<TextRef, RNTextProps>((props, forwardedRef) => {
  const { children, ...textSlotProps } = props

  if (!React.isValidElement(children)) {
    console.log("Slot.Text - Invalid asChild element", children)
    return null
  }

  return React.cloneElement<
    React.ComponentPropsWithoutRef<typeof RNText>,
    TextRef
  >(isTextChildren(children) ? <></> : children, {
    ...mergeProps(textSlotProps, children.props),
    ref: forwardedRef
      ? composeRefs(forwardedRef, (children as any).ref)
      : (children as any).ref,
  })
})

export { Pressable, Text, View }

// This project uses code from WorkOS/Radix Primitives.
// The code is licensed under the MIT License.
// https://github.com/radix-ui/primitives/tree/main

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T) =>
    refs.forEach(ref => {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T>).current = node
      }
    })
}

type AnyProps = Record<string, any>

function mergeProps(slotProps: AnyProps, childProps: AnyProps) {
  // all child props should override
  const overrideProps = { ...childProps }

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName]
    const childPropValue = childProps[propName]

    const isHandler = /^on[A-Z]/.test(propName)
    if (isHandler) {
      // if the handler exists on both, we compose them
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          childPropValue(...args)
          slotPropValue(...args)
        }
      }
      // but if it exists only on the slot, we use only this one
      else if (slotPropValue) {
        overrideProps[propName] = slotPropValue
      }
    }
    // if it's `style`, we merge them
    else if (propName === "style") {
      overrideProps[propName] = combineStyles(slotPropValue, childPropValue)
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(" ")
    }
  }

  return { ...slotProps, ...overrideProps }
}

type PressableStyle = RNPressableProps["style"]
type ImageStyle = StyleProp<RNImageStyle>
type Style = PressableStyle | ImageStyle

function combineStyles(slotStyle?: Style, childValue?: Style) {
  if (typeof slotStyle === "function" && typeof childValue === "function") {
    return (state: PressableStateCallbackType) => {
      return StyleSheet.flatten([slotStyle(state), childValue(state)])
    }
  }
  if (typeof slotStyle === "function") {
    return (state: PressableStateCallbackType) => {
      return childValue
        ? StyleSheet.flatten([slotStyle(state), childValue])
        : slotStyle(state)
    }
  }
  if (typeof childValue === "function") {
    return (state: PressableStateCallbackType) => {
      return slotStyle
        ? StyleSheet.flatten([slotStyle, childValue(state)])
        : childValue(state)
    }
  }

  return StyleSheet.flatten([slotStyle, childValue].filter(Boolean))
}

export function isTextChildren(
  children:
    | React.ReactNode
    | ((state: PressableStateCallbackType) => React.ReactNode),
) {
  return Array.isArray(children)
    ? children.every(child => typeof child === "string")
    : typeof children === "string"
}
