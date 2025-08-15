"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TypingGame() {
  const [currentText, setCurrentText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameActive, setGameActive] = useState(false)
  const [wpm, setWpm] = useState(0)

  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Space exploration has always fascinated humanity.",
    "Virtual reality is changing how we interact with technology.",
    "Artificial intelligence is revolutionizing many industries.",
    "The future of computing lies in quantum mechanics.",
  ]

  const startGame = useCallback(() => {
    setGameActive(true)
    setTimeLeft(60)
    setScore(0)
    setUserInput("")
    setCurrentText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
  }, [])

  const endGame = useCallback(() => {
    setGameActive(false)
    const wordsTyped = userInput.trim().split(" ").length
    setWpm(Math.round((wordsTyped / 1) * 60)) // 1 minute game
  }, [userInput])

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      endGame()
    }
  }, [gameActive, timeLeft, endGame])

  useEffect(() => {
    if (gameActive) {
      const correctChars = userInput.split("").filter((char, index) => char === currentText[index]).length
      setScore(correctChars)
    }
  }, [userInput, currentText, gameActive])

  const getCharacterClass = (index: number) => {
    if (index >= userInput.length) return "text-muted-foreground"
    return userInput[index] === currentText[index] ? "text-green-500" : "text-red-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Virtual Typing Game</h1>
          <p className="text-blue-200">Test your typing speed in space!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Time Left</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{timeLeft}s</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{score}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">WPM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{wpm}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Type the text below:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-black/20 rounded-lg font-mono text-lg leading-relaxed">
              {currentText.split("").map((char, index) => (
                <span key={index} className={getCharacterClass(index)}>
                  {char}
                </span>
              ))}
            </div>

            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={!gameActive}
              placeholder="Start typing here..."
              className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 font-mono text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="flex justify-center">
              {!gameActive ? (
                <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
                  Start Game
                </Button>
              ) : (
                <Button onClick={endGame} variant="destructive" className="px-8 py-2">
                  End Game
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {!gameActive && wpm > 0 && (
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Game Over!</h3>
              <p className="text-blue-200">Your typing speed: {wpm} WPM</p>
              <p className="text-blue-200">Characters typed correctly: {score}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
