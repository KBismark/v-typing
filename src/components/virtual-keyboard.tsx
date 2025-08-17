"use client"

import { Canvas } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { useRef } from "react"
import type { Mesh } from "three"

const SHIFT_KEY_MAP: Record<string, string> = {
  "`": "~",
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "0": ")",
  "-": "_",
  "=": "+",
  "[": "{",
  "]": "}",
  "\\": "|",
  ";": ":",
  "'": '"',
  ",": "<",
  ".": ">",
  "/": "?",
}

const FINGER_MAP: Record<string, string> = {
  // Left pinky
  "`": "left-pinky",
  "1": "left-pinky",
  q: "left-pinky",
  a: "left-pinky",
  z: "left-pinky",
  tab: "left-pinky",
  capslock: "left-pinky",
  shift: "left-pinky",

  // Left ring finger
  "2": "left-ring",
  w: "left-ring",
  s: "left-ring",
  x: "left-ring",

  // Left middle finger
  "3": "left-middle",
  e: "left-middle",
  d: "left-middle",
  c: "left-middle",

  // Left index finger
  "4": "left-index",
  "5": "left-index",
  r: "left-index",
  t: "left-index",
  f: "left-index",
  g: "left-index",
  v: "left-index",
  b: "left-index",

  // Right index finger
  "6": "right-index",
  "7": "right-index",
  y: "right-index",
  u: "right-index",
  h: "right-index",
  j: "right-index",
  n: "right-index",
  m: "right-index",

  // Right middle finger
  "8": "right-middle",
  i: "right-middle",
  k: "right-middle",
  ",": "right-middle",

  // Right ring finger
  "9": "right-ring",
  o: "right-ring",
  l: "right-ring",
  ".": "right-ring",

  // Right pinky
  "0": "right-pinky",
  "-": "right-pinky",
  "=": "right-pinky",
  p: "right-pinky",
  "[": "right-pinky",
  "]": "right-pinky",
  "\\": "right-pinky",
  ";": "right-pinky",
  "'": "right-pinky",
  "/": "right-pinky",
  backspace: "right-pinky",
  enter: "right-pinky",

  // Thumbs
  " ": "thumb",
}

const HOME_ROW_POSITIONS: Record<string, string> = {
  "left-pinky": "a",
  "left-ring": "s",
  "left-middle": "d",
  "left-index": "f",
  "right-index": "j",
  "right-middle": "k",
  "right-ring": "l",
  "right-pinky": ";",
}

const KEYBOARD_LAYOUT = [
  [
    { key: "`", width: 1 },
    { key: "1", width: 1 },
    { key: "2", width: 1 },
    { key: "3", width: 1 },
    { key: "4", width: 1 },
    { key: "5", width: 1 },
    { key: "6", width: 1 },
    { key: "7", width: 1 },
    { key: "8", width: 1 },
    { key: "9", width: 1 },
    { key: "0", width: 1 },
    { key: "-", width: 1 },
    { key: "=", width: 1 },
    { key: "Backspace", width: 2 },
  ],
  [
    { key: "Tab", width: 1.5 },
    { key: "q", width: 1 },
    { key: "w", width: 1 },
    { key: "e", width: 1 },
    { key: "r", width: 1 },
    { key: "t", width: 1 },
    { key: "y", width: 1 },
    { key: "u", width: 1 },
    { key: "i", width: 1 },
    { key: "o", width: 1 },
    { key: "p", width: 1 },
    { key: "[", width: 1 },
    { key: "]", width: 1 },
    { key: "\\", width: 1.5 },
  ],
  [
    { key: "CapsLock", width: 1.75 },
    { key: "a", width: 1 },
    { key: "s", width: 1 },
    { key: "d", width: 1 },
    { key: "f", width: 1 },
    { key: "g", width: 1 },
    { key: "h", width: 1 },
    { key: "j", width: 1 },
    { key: "k", width: 1 },
    { key: "l", width: 1 },
    { key: ";", width: 1 },
    { key: "'", width: 1 },
    { key: "Enter", width: 2.25 },
  ],
  [
    { key: "Shift", width: 2.25 },
    { key: "z", width: 1 },
    { key: "x", width: 1 },
    { key: "c", width: 1 },
    { key: "v", width: 1 },
    { key: "b", width: 1 },
    { key: "n", width: 1 },
    { key: "m", width: 1 },
    { key: ",", width: 1 },
    { key: ".", width: 1 },
    { key: "/", width: 1 },
    { key: "Shift", width: 2.75 },
  ],
  [
    { key: "Ctrl", width: 1.25 },
    { key: "Win", width: 1.25 },
    { key: "Alt", width: 1.25 },
    { key: " ", width: 6.25 },
    { key: "Alt", width: 1.25 },
    { key: "Win", width: 1.25 },
    { key: "Menu", width: 1.25 },
    { key: "Ctrl", width: 1.25 },
  ],
]

interface KeyProps {
  keyData: { key: string; width: number }
  position: [number, number, number]
  isPressed: boolean
  isNext?: boolean
  isFingerPosition?: boolean // Added finger position highlighting
  isShiftPressed: boolean
  isCapsLockOn: boolean
}

function Key({ keyData, position, isPressed, isNext, isFingerPosition, isShiftPressed, isCapsLockOn }: KeyProps) {
  const meshRef = useRef<Mesh>(null)
  const { key, width } = keyData

  const keyWidth = width * 1.1
  const keyHeight = 1.1

  const getDisplayCharacter = () => {
    if (key === " ") return "SPACE"
    if (key.length > 1) return key.toUpperCase() // Special keys like Shift, Enter, etc.

    if (/[a-z]/.test(key)) {
      const shouldBeUppercase = isShiftPressed !== isCapsLockOn
      return shouldBeUppercase ? key.toUpperCase() : key
    }

    if (isShiftPressed) {
      return SHIFT_KEY_MAP[key] || key.toUpperCase()
    }

    return key.toUpperCase()
  }

  const getKeyColor = () => {
    if (isPressed) return "#8b5cf6"
    if (isNext) return "#5cd5f6"
    if (isFingerPosition) return "#10b981" // Green for finger positions
    if (key === "CapsLock" && isCapsLockOn) return "#059669"
    return "#334155"
  }

  const getEmissiveColor = () => {
    if (isPressed) return "#8b5cf6"
    if (isNext) return "#5cd5f6"
    if (isFingerPosition) return "#10b981" // Green emissive for finger positions
    if (key === "CapsLock" && isCapsLockOn) return "#059669"
    return "#000000"
  }

  const getEmissiveIntensity = () => {
    if (isPressed) return 0.3
    if (isNext) return 0.3
    if (isFingerPosition) return 0.2 // Subtle glow for finger positions
    if (key === "CapsLock" && isCapsLockOn) return 0.2
    return 0
  }

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, 0, isPressed ? -0.1 : 0]}>
        <boxGeometry args={[keyWidth, keyHeight, 0.2]} />
        <meshStandardMaterial
          color={getKeyColor()}
          emissive={getEmissiveColor()}
          emissiveIntensity={getEmissiveIntensity()}
        />
      </mesh>
      <Text
        position={[0, 0, isPressed ? 0.05 : 0.15]}
        fontSize={key.length > 3 ? 0.25 : 0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        {getDisplayCharacter()}
      </Text>
      {SHIFT_KEY_MAP[key] && !isShiftPressed && (
        <Text
          position={[0, 0.3, isPressed ? 0.05 : 0.15]}
          fontSize={0.2}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          {SHIFT_KEY_MAP[key]}
        </Text>
      )}
    </group>
  )
}

interface VirtualKeyboardProps {
  pressedKeys: Set<string>
  isCapsLockOn: boolean
  nextKey: string
}

export default function VirtualKeyboard({ pressedKeys, isCapsLockOn, nextKey }: VirtualKeyboardProps) {
  const isShiftPressed = pressedKeys.has("shift")

  const getFingerPositionsToHighlight = (targetKey: string): Set<string> => {
    const positions = new Set<string>()

    if (!targetKey) return positions

    const targetFinger = FINGER_MAP[targetKey.toLowerCase()]
    if (!targetFinger) return positions

    // Highlight home positions for all fingers except the one typing
    Object.entries(HOME_ROW_POSITIONS).forEach(([finger, homeKey]) => {
      if (finger !== targetFinger) {
        positions.add(homeKey)
      }
    })

    return positions
  }

  const fingerPositions = getFingerPositionsToHighlight(nextKey)

  return (
    <div className="w-full h-96 transform -translate-x-4">
      <Canvas camera={{ fov: 100, near: 0.1, far: 1000, position: [0.04, -0.4, 3.6] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 0, 5]} intensity={0.4} color="#8b5cf6" />
        <pointLight position={[5, 0, 5]} intensity={0.4} color="#06b6d4" />

        {KEYBOARD_LAYOUT.map((row, rowIndex) => {
          let xOffset = 0
          return row.map((keyData, colIndex) => {
            const x = xOffset - 8 + keyData.width / 2
            const y = 3.5 - rowIndex * 1.3
            const z = 0

            xOffset += keyData.width * 1.1 + 0.1

            let keyToCheck = keyData.key.toLowerCase()
            if (keyData.key === " ") keyToCheck = " "
            else if (keyData.key === "Backspace") keyToCheck = "backspace"
            else if (keyData.key === "Enter") keyToCheck = "enter"
            else if (keyData.key === "Shift") keyToCheck = "shift"
            else if (keyData.key === "Tab") keyToCheck = "tab"
            else if (keyData.key === "CapsLock") keyToCheck = "capslock"
            else if (keyData.key === "Ctrl") keyToCheck = "control"
            else if (keyData.key === "Alt") keyToCheck = "alt"
            else if (keyData.key === "Win") keyToCheck = "meta"

            return (
              <Key
                key={`${rowIndex}-${colIndex}`}
                keyData={keyData}
                position={[x, y, z]}
                isPressed={pressedKeys.has(keyToCheck)}
                isShiftPressed={isShiftPressed}
                isCapsLockOn={isCapsLockOn}
                isNext={keyData.key.toLowerCase() === nextKey.toLowerCase()}
                isFingerPosition={fingerPositions.has(keyData.key.toLowerCase())} // Added finger position highlighting
              />
            )
          })
        })}
      </Canvas>
    </div>
  )
}
