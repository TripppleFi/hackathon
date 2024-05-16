import { default as day, type ConfigType } from "dayjs"
import relativeTimePlugin from "dayjs/plugin/relativeTime"

day.extend(relativeTimePlugin)

function date(config: ConfigType) {
  return day(config)
}

export { date }
