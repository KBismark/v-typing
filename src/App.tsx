"use client"

import { useState, useEffect, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import VirtualKeyboard from "@/components/virtual-keyboard"
import GameInterface from "@/components/game-interface"
import { WORDS, LEFT_HAND, RIGHT_HAND } from "@/lib/dictionary"



const TIME_OPTIONS = [0.2, 0.3, 0.6, 1, 2, 3, 5]

type MissionType = "WORDS" | "LEFT_HAND" | "RIGHT_HAND" | "TIMED_TYPING"

const GAME_TIME = 30 // seconds

export default function SpaceTypingGame() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu")
  const [missionType, setMissionType] = useState<MissionType>("WORDS")
  const [wordTimeLimit, setWordTimeLimit] = useState(1) // seconds per word
  const [customTimeInput, setCustomTimeInput] = useState("")
  const [isUsingCustomTime, setIsUsingCustomTime] = useState(false)
  const [wordTimeLeft, setWordTimeLeft] = useState(1) // time left for current word
  const [currentWord, setCurrentWord] = useState("")
  const [typedText, setTypedText] = useState("")
  const [nextCorrectKeyIndex, setNextCorrectKeyIndex] = useState(0)
  const [needsBackspace, setNeedsBackspace] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [score, setScore] = useState(0)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)
  const [totalMistakes, setTotalMistakes] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)

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
    const newWord = getRandomWord()
    setCurrentWord(newWord)
    setTypedText("")
    setTimeLeft(GAME_TIME)
    setWordTimeLeft(missionType === "TIMED_TYPING" ? wordTimeLimit : GAME_TIME)
    setScore(0)
    setWordsCompleted(0)
    setPressedKeys(new Set())
    setNeedsBackspace(false)
    setTotalMistakes(0)
    setTotalKeystrokes(0)
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
        setTotalKeystrokes((prev) => prev + 1)
      } else if (key.length === 1 && /[a-z]/.test(key)) {
        const isShiftPressed = event.shiftKey
        const shouldBeUppercase = isShiftPressed !== isCapsLockOn
        const characterToAdd = shouldBeUppercase ? key.toUpperCase() : key

        const newTypedText = typedText + characterToAdd
        setTotalKeystrokes((prev) => prev + 1)

        const currentPosition = typedText.length
        if (currentPosition < currentWord.length) {
          const expectedChar = currentWord[currentPosition].toLowerCase()
          const typedChar = characterToAdd.toLowerCase()

          if (typedChar !== expectedChar) {
            playErrorSound()
            setTotalMistakes((prev) => prev + 1)
          }
        } else {
          playErrorSound()
          setTotalMistakes((prev) => prev + 1)
        }

        setTypedText(newTypedText)

        if (newTypedText.toLowerCase() === currentWord.toLowerCase()) {
          setScore((prev) => prev + currentWord.length * 10)
          setWordsCompleted((prev) => prev + 1)
          const newWord = getRandomWord()
          setCurrentWord(newWord)
          setTypedText("")
          setNextCorrectKeyIndex(0)
          setNeedsBackspace(false)
          if (missionType === "TIMED_TYPING") {
            setWordTimeLeft(wordTimeLimit)
          }
        }
      }
    },
    [gameState, typedText, currentWord, isCapsLockOn, playErrorSound, missionType, wordTimeLimit],
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

  useEffect(() => {
    if (gameState === "playing") {
      window.addEventListener("keydown", handleKeyPress)
    } else {
      window.removeEventListener("keydown", handleKeyPress)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [gameState, handleKeyPress])

  useEffect(() => {
    if (gameState === "playing") {
      const timer = setTimeout(
        () => {
          if (missionType === "TIMED_TYPING") {
            if (wordTimeLeft > 0) {
              setWordTimeLeft((prev) => prev - 0.1)
            } else {
              endGame()
            }
          } else {
            if (timeLeft > 0) {
              setTimeLeft((prev) => prev - 1)
            } else {
              endGame()
            }
          }
        },
        missionType === "TIMED_TYPING" ? 100 : 1000,
      )

      return () => clearTimeout(timer)
    }
  }, [gameState, timeLeft, wordTimeLeft, missionType, wordTimeLimit])

  const handleCustomTimeChange = (value: string) => {
    setCustomTimeInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0 && numValue <= 60) {
      setWordTimeLimit(numValue)
      setIsUsingCustomTime(true)
    }
  }

  const handlePresetTimeSelect = (time: number) => {
    setWordTimeLimit(time)
    setIsUsingCustomTime(false)
    setCustomTimeInput("")
  }

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
                <Button
                  onClick={() => setMissionType("TIMED_TYPING")}
                  variant={missionType === "TIMED_TYPING" ? "default" : "outline"}
                  className="w-full"
                >
                  Timed Typing
                </Button>
              </div>

              {missionType === "TIMED_TYPING" && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Time per word (seconds):</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {TIME_OPTIONS.map((time) => (
                      <Button
                        key={time}
                        onClick={() => handlePresetTimeSelect(time)}
                        variant={wordTimeLimit === time && !isUsingCustomTime ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {time}s
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Or enter custom time:</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0.1"
                        max="60"
                        step="0.1"
                        placeholder="e.g. 1.5"
                        value={customTimeInput}
                        onChange={(e) => handleCustomTimeChange(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span className="text-sm text-muted-foreground">seconds</span>
                    </div>
                    {isUsingCustomTime && <p className="text-xs text-primary">Using custom time: {wordTimeLimit}s</p>}
                  </div>
                </div>
              )}

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
              timeLeft={missionType === "TIMED_TYPING" ? wordTimeLeft : timeLeft}
              score={score}
              wordsCompleted={wordsCompleted}
              totalTime={missionType === "TIMED_TYPING" ? wordTimeLimit : GAME_TIME}
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
                <p className="text-lg">
                  Words Per Second:{" "}
                  <span className="text-accent font-bold">
                    {missionType === "TIMED_TYPING" ? "N/A" : (wordsCompleted / (GAME_TIME - timeLeft)).toFixed(1)}
                  </span>
                </p>
                <p className="text-lg">
                  Mistakes Rate:{" "}
                  <span className="text-destructive font-bold">
                    {totalKeystrokes > 0 ? ((totalMistakes / totalKeystrokes) * 100).toFixed(1) : 0}%
                  </span>
                </p>
                <p className="text-muted-foreground">
                  {missionType === "TIMED_TYPING"
                    ? wordsCompleted >= 20
                      ? "Lightning fast reflexes!"
                      : wordsCompleted >= 10
                        ? "Good speed training!"
                        : "Keep practicing your speed!"
                    : missionType === "LEFT_HAND"
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
