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
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const wpm = Math.round(wordsCompleted / ((totalTime - timeLeft) / 60) || 0)

  const renderWord = () => {
    return currentWord.split("").map((char, index) => {
      let className = "text-2xl font-mono "

      if (index < typedText.length) {
        // Character has been typed
        if (typedText[index].toLowerCase() === char.toLowerCase()) {
          className += "text-accent bg-accent/20 rounded px-1" // Correct
        } else {
          className += "text-destructive bg-destructive/20 rounded px-1" // Incorrect
        }
      } else if (index === typedText.length) {
        className += "text-foreground bg-primary/30 rounded px-1 animate-pulse" // Current character
      } else {
        className += "text-muted-foreground" // Not yet typed
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
      {/* Stats Bar */}
      <div className="w-full max-w-4xl">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{wordsCompleted}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-foreground">{wpm}</div>
                <div className="text-sm text-muted-foreground">WPM</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">{timeLeft}</div>
              <div className="text-sm text-muted-foreground">Time Left</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Word Display */}
      <div className="text-center space-y-4">
        <div className="text-sm text-muted-foreground uppercase tracking-wider">Type this word:</div>
        <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-8 min-h-[100px] flex items-center justify-center">
          <div className="space-x-1">{renderWord()}</div>
        </div>

        {/* Typed Text Display */}
        <div className="text-sm text-muted-foreground">
          Typed: <span className="font-mono text-foreground">{typedText}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground max-w-md">
        Type the word above as quickly and accurately as possible. Green letters are correct, red letters are mistakes.
      </div>
    </div>
  )
}
