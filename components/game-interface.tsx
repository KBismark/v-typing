"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface GameInterfaceProps {
  currentWord: string
  typedText: string
  timeLeft: number
  score: number
  wordsCompleted: number
  totalTime: number
}

export default function GameInterface({
  currentWord,
  typedText,
  timeLeft,
  score,
  wordsCompleted,
  totalTime,
}: GameInterfaceProps) {
  const timeProgress = (timeLeft / totalTime) * 100
  const isCorrect = (index: number) => typedText[index] === currentWord[index]
  const isTyped = (index: number) => index < typedText.length

  return (
    <div className="flex flex-col items-center space-y-8 w-full px-8 py-12">
      {/* Stats Bar */}
      <div className="flex gap-12 text-center">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 min-w-[120px]">
          <div className="text-3xl font-bold text-primary">{score}</div>
          <div className="text-base text-muted-foreground">Score</div>
        </Card>
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 min-w-[120px]">
          <div className="text-3xl font-bold text-accent">{wordsCompleted}</div>
          <div className="text-base text-muted-foreground">Words</div>
        </Card>
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-destructive/20 min-w-[120px]">
          <div className="text-3xl font-bold text-destructive">{timeLeft}</div>
          <div className="text-base text-muted-foreground">Time</div>
        </Card>
      </div>

      {/* Time Progress */}
      <div className="w-full max-w-2xl">
        <Progress value={timeProgress} className="h-4 bg-muted/20" />
      </div>

      {/* Word Display */}
      <Card className="p-12 bg-card/80 backdrop-blur-sm border-primary/20 text-center min-w-[600px]">
        <div className="text-lg text-muted-foreground mb-4">Type this word:</div>
        <div className="text-6xl font-bold font-mono tracking-wider mb-6">
          {currentWord.split("").map((char, index) => (
            <span
              key={index}
              className={`
                ${
                  isTyped(index)
                    ? isCorrect(index)
                      ? "text-accent bg-accent/20"
                      : "text-destructive bg-destructive/20"
                    : "text-muted-foreground"
                }
                px-2 py-1 rounded transition-colors duration-200
              `}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Typed Text Display */}
        <div className="text-xl text-muted-foreground">
          Your input: <span className="font-mono text-foreground">{typedText}</span>
          <span className="animate-pulse">|</span>
        </div>
      </Card>

      {/* Instructions */}
      <div className="text-center text-muted-foreground">
        <p className="text-base">Use your keyboard to type the word above</p>
        <p className="text-base">Complete as many words as possible before time runs out!</p>
      </div>
    </div>
  )
}
