import { useState } from "react"
import type { MissionType } from "./useTypingGame"

export const TIME_OPTIONS = [0.2, 0.3, 0.6, 1, 2, 3, 5]

export interface MenuConfig {
  missionType: MissionType
  setMissionType: (type: MissionType) => void
  wordTimeLimit: number
  customTimeInput: string
  isUsingCustomTime: boolean
  timeOptions: number[]
  handleCustomTimeChange: (value: string) => void
  handlePresetTimeSelect: (time: number) => void
}

export function useMenuConfig(): MenuConfig {
  const [missionType, setMissionType] = useState<MissionType>("WORDS")
  const [wordTimeLimit, setWordTimeLimit] = useState(1) // seconds per word
  const [customTimeInput, setCustomTimeInput] = useState("")
  const [isUsingCustomTime, setIsUsingCustomTime] = useState(false)

  const handleCustomTimeChange = (value: string) => {
    setCustomTimeInput(value)
    const numValue = Number.parseFloat(value)
    if (!Number.isNaN(numValue) && numValue > 0 && numValue <= 60) {
      setWordTimeLimit(numValue)
      setIsUsingCustomTime(true)
    }
  }

  const handlePresetTimeSelect = (time: number) => {
    setWordTimeLimit(time)
    setIsUsingCustomTime(false)
    setCustomTimeInput("")
  }

  return {
    missionType,
    setMissionType,
    wordTimeLimit,
    customTimeInput,
    isUsingCustomTime,
    timeOptions: TIME_OPTIONS,
    handleCustomTimeChange,
    handlePresetTimeSelect,
  }
}
