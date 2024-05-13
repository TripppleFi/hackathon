import React from "react"
import { StyleSheet, type ColorValue, type ViewProps } from "react-native"
import { Path, default as Svg, type SvgProps } from "react-native-svg"
import { faCcVisa } from "@fortawesome/free-brands-svg-icons"
import {
  FontAwesomeIcon,
  type FontAwesomeIconStyle,
} from "@fortawesome/react-native-fontawesome"
import { icons } from "lucide-react-native"

import { ButtonProps } from "@/components/button"

interface IconProps {
  name: keyof typeof icons
  variant?: NonNullable<ButtonProps["variant"]>
  className?: string
  style?: ViewProps["style"]
  size?: number
  fill?: string
  color?: string
}

export function Icon({
  name,
  variant = "default",
  fill = "currentColor",
  color,
  size = 16,
  style = {},
}: IconProps) {
  const LucideIcon = icons[name]
  const colors: Record<typeof variant, ColorValue> = {
    default: "white",
    outline: "black",
    secondary: "gray",
    ghost: "black",
  }

  return (
    <LucideIcon
      fill={fill}
      color={color ?? colors[variant]}
      size={size}
      style={style}
    />
  )
}

const BrandIcons = {
  visa: faCcVisa,
}

interface BrandIconProps {
  name: keyof typeof BrandIcons
  style?: FontAwesomeIconStyle
  className?: string
  size?: number
}

// @ts-expect-error
FontAwesomeIcon.defaultProps = undefined

export function BrandIcon({ name, style = {}, size }: BrandIconProps) {
  const icon = BrandIcons[name]
  return <FontAwesomeIcon size={size} icon={icon} style={style} />
}

export const Sui = createIcon((props: SvgProps) => {
  return (
    <Svg viewBox="0 0 96 123" {...props}>
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M76.2403 51.397C81.2079 57.6341 84.1784 65.5221 84.1784 74.1025C84.1784 82.6829 81.1176 90.8117 76.0195 97.084L75.5779 97.6259L75.4625 96.9385C75.3622 96.3564 75.2468 95.7643 75.1113 95.1722C72.5572 83.9524 64.2377 74.3333 50.5442 66.5407C41.2964 61.2921 36.0026 54.9797 34.6127 47.7992C33.7145 43.1577 34.3819 38.4962 35.6715 34.5021C36.961 30.5129 38.8778 27.166 40.5086 25.1539L45.8375 18.6408C46.7708 17.4968 48.522 17.4968 49.4553 18.6408L76.2453 51.397H76.2403ZM84.6652 44.8889L48.9586 1.23409C48.2761 0.401137 47.0016 0.401137 46.3192 1.23409L10.6176 44.8889L10.5022 45.0344C3.93395 53.1883 0 63.5501 0 74.8301C0 101.098 21.3306 122.394 47.6389 122.394C73.9472 122.394 95.2778 101.098 95.2778 74.8301C95.2778 63.5501 91.3438 53.1883 84.7755 45.0394L84.6601 44.8939L84.6652 44.8889ZM19.1629 51.2565L22.3542 47.3476L22.4496 48.0702C22.5249 48.6422 22.6202 49.2142 22.7306 49.7913C24.7979 60.6347 32.1791 69.6718 44.5178 76.6716C55.2459 82.7783 61.493 89.7981 63.2894 97.4954C64.042 100.707 64.1725 103.868 63.8463 106.633L63.8263 106.803L63.6707 106.879C58.8286 109.242 53.3843 110.572 47.6339 110.572C27.4573 110.572 11.0993 94.2439 11.0993 74.0975C11.0993 65.4468 14.115 57.5036 19.1529 51.2465L19.1629 51.2565Z"
        fill="currentColor"
      />
    </Svg>
  )
})

function createIcon(comp: (p: SvgProps) => JSX.Element) {
  return (props: SvgProps) => {
    // @ts-expect-error
    const size = StyleSheet.flatten(props.style).fontSize ?? 16
    return comp({
      ...props,
      width: Number(props.width ?? size) / 1.5,
      height: Number(props.height ?? size) / 1.5,
    })
  }
}
