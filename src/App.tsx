"use client"

import { useState, useEffect, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import VirtualKeyboard from "@/components/virtual-keyboard"
import GameInterface from "@/components/game-interface"

const WORDS = [
  "space",
  "galaxy",
  "nebula",
  "cosmos",
  "stellar",
  "orbit",
  "planet",
  "meteor",
  "asteroid",
  "comet",
  "universe",
  "infinity",
  "quantum",
  "gravity",
  "fusion",
]

const LEFT_HAND = [
  "qwert",
  "asdfg",
  "zxcvb",
  "qwe",
  "asd",
  "zxc",
  "wer",
  "sdf",
  "xcv",
  "ert",
  "dfg",
  "cvb",
  "qwer",
  "asdf",
  "zxcv",
]

const RIGHT_HAND = [
  "yuiop",
  "hjkl",
  "nm",
  "yui",
  "hjk",
  "uio",
  "jkl",
  "iop",
  "yuio",
  "hjkl",
  "uiop",
  "jklm",
  "yui",
  "hjk",
  "iop",
]

type MissionType = "WORDS" | "LEFT_HAND" | "RIGHT_HAND"

const GAME_TIME = 30 // seconds

export default function SpaceTypingGame() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu")
  const [missionType, setMissionType] = useState<MissionType>("WORDS")
  const [currentWord, setCurrentWord] = useState("")
  const [typedText, setTypedText] = useState("")
  const [nextCorrectKeyIndex, setNextCorrectKeyIndex] = useState(0)
  const [needsBackspace, setNeedsBackspace] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [score, setScore] = useState(0)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  const getRandomWord = () => {
    switch (missionType) {
      case "LEFT_HAND":
        return LEFT_HAND[Math.floor(Math.random() * LEFT_HAND.length)]
      case "RIGHT_HAND":
        return RIGHT_HAND[Math.floor(Math.random() * RIGHT_HAND.length)]
      default:
        return WORDS[Math.floor(Math.random() * WORDS.length)]
    }
  }

  const startGame = () => {
    setGameState("playing")
    setCurrentWord(getRandomWord())
    setTypedText("")
    setTimeLeft(GAME_TIME)
    setScore(0)
    setWordsCompleted(0)
    setPressedKeys(new Set())
    setNeedsBackspace(false)
  }

  const endGame = () => {
    setGameState("gameOver")
    setPressedKeys(new Set())
  }

  const playErrorSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(200, audioContext.currentTime) // Low frequency beep
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log("Audio not supported")
    }
  }, [])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (gameState !== "playing") return

      const key = event.key.toLowerCase()

      if (key === "capslock") {
        setIsCapsLockOn((prev) => !prev)
      }

      setPressedKeys((prev) => new Set(prev).add(key))
      setTimeout(() => {
        setPressedKeys((prev) => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
      }, 200)

      if (key === "backspace") {
        setTypedText((prev) => prev.slice(0, -1))
      } else if (key.length === 1 && /[a-z]/.test(key)) {
        const isShiftPressed = event.shiftKey
        const shouldBeUppercase = isShiftPressed !== isCapsLockOn
        const characterToAdd = shouldBeUppercase ? key.toUpperCase() : key

        const newTypedText = typedText + characterToAdd

        const currentPosition = typedText.length
        if (currentPosition < currentWord.length) {
          const expectedChar = currentWord[currentPosition].toLowerCase()
          const typedChar = characterToAdd.toLowerCase()

          if (typedChar !== expectedChar) {
            playErrorSound()
          }
        } else {
          playErrorSound()
        }

        setTypedText(newTypedText)

        if (newTypedText.toLowerCase() === currentWord.toLowerCase()) {
          setScore((prev) => prev + currentWord.length * 10)
          setWordsCompleted((prev) => prev + 1)
          setCurrentWord(getRandomWord())
          setTypedText("")
          setNextCorrectKeyIndex(0)
          setNeedsBackspace(false)
        }
      }
    },
    [gameState, typedText, currentWord, isCapsLockOn, playErrorSound],
  )

  useEffect(() => {
    if (gameState !== "playing") return

    let nextIndex = typedText.length
    let hasIncorrectCharacters = false

    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i].toLowerCase() !== currentWord[i].toLowerCase()) {
        nextIndex = i
        hasIncorrectCharacters = true
        break
      }
    }

    if (nextIndex >= currentWord.length) {
      nextIndex = currentWord.length - 1
    }

    setNextCorrectKeyIndex(nextIndex)
    setNeedsBackspace(hasIncorrectCharacters)
  }, [typedText, currentWord, gameState])

  return (
    <div className="w-full h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Stars radius={300} depth={60} count={1000} factor={7} saturation={0} fade speed={1} />
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 flex flex-col h-full">
        {gameState === "menu" && (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20 text-center max-w-md">
              <h1 className="text-4xl font-bold mb-4 text-primary animate-glow">Space Typer</h1>
              <p className="text-muted-foreground mb-6">Choose your training mission:</p>

              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => setMissionType("WORDS")}
                  variant={missionType === "WORDS" ? "default" : "outline"}
                  className="w-full"
                >
                  Main Mission (Words)
                </Button>
                <Button
                  onClick={() => setMissionType("LEFT_HAND")}
                  variant={missionType === "LEFT_HAND" ? "default" : "outline"}
                  className="w-full"
                >
                  Left Hand Training
                </Button>
                <Button
                  onClick={() => setMissionType("RIGHT_HAND")}
                  variant={missionType === "RIGHT_HAND" ? "default" : "outline"}
                  className="w-full"
                >
                  Right Hand Training
                </Button>
              </div>

              <Button onClick={startGame} className="bg-primary hover:bg-primary/80 text-primary-foreground w-full">
                Start Mission
              </Button>
            </Card>
          </div>
        )}

        {gameState === "playing" && (
          <div className="flex-1 flex flex-col">
            <GameInterface
              currentWord={currentWord}
              typedText={typedText}
              timeLeft={timeLeft}
              score={score}
              wordsCompleted={wordsCompleted}
              totalTime={GAME_TIME}
            />
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-destructive/20 text-center">
              <h2 className="text-3xl font-bold mb-4 text-destructive">Mission Complete!</h2>
              <div className="space-y-2 mb-6">
                <p className="text-xl">
                  Final Score: <span className="text-primary font-bold">{score}</span>
                </p>
                <p className="text-lg">
                  Words Completed: <span className="text-accent font-bold">{wordsCompleted}</span>
                </p>
                <p className="text-muted-foreground">
                  {missionType === "LEFT_HAND"
                    ? wordsCompleted >= 10
                      ? "Left hand mastery achieved!"
                      : wordsCompleted >= 5
                        ? "Good left hand progress!"
                        : "Keep training your left hand!"
                    : missionType === "RIGHT_HAND"
                      ? wordsCompleted >= 10
                        ? "Right hand mastery achieved!"
                        : wordsCompleted >= 5
                          ? "Good right hand progress!"
                          : "Keep training your right hand!"
                      : wordsCompleted >= 10
                        ? "Excellent work, Space Commander!"
                        : wordsCompleted >= 5
                          ? "Good job, Cadet!"
                          : "Keep practicing, Recruit!"}
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={startGame} className="bg-primary hover:bg-primary/80 text-primary-foreground w-full">
                  Try Again
                </Button>
                <Button onClick={() => setGameState("menu")} variant="outline" className="w-full">
                  Change Mission
                </Button>
              </div>
            </Card>
          </div>
        )}

        {gameState === "playing" && (
          <div className="absolute bottom-4 bg-[#0f172a] left-0 right-0 px-4 -mb-16">
            <VirtualKeyboard
              pressedKeys={pressedKeys}
              isCapsLockOn={isCapsLockOn}
              nextKey={needsBackspace ? "Backspace" : currentWord[nextCorrectKeyIndex]}
            />
          </div>
        )}
      </div>
    </div>
  )
}
