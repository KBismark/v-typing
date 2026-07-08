import { Canvas } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import VirtualKeyboard from "@/components/virtual-keyboard"
import GameInterface from "@/components/game-interface"
import { useTypingGame, GAME_TIME } from "@/hooks/useTypingGame"
import { useMenuConfig } from "@/hooks/useMenuConfig"

export default function SpaceTypingGame() {
  const menu = useMenuConfig()
  const game = useTypingGame({ missionType: menu.missionType, wordTimeLimit: menu.wordTimeLimit })

  const {
    status,
    currentWord,
    typedText,
    score,
    timeLeft,
    wordTimeLeft,
    wordsCompleted,
    totalKeystrokes,
    totalMistakes,
    isCapsLockOn,
    pressedKeys,
    nextCorrectKeyIndex,
    needsBackspace,
    startGame,
    goToMenu,
  } = game

  const isTimed = menu.missionType === "TIMED_TYPING"
  const activeTimeLeft = isTimed ? wordTimeLeft : timeLeft
  const totalTime = isTimed ? menu.wordTimeLimit : GAME_TIME

  const getRankMessage = () => {
    if (isTimed) {
      return wordsCompleted >= 20
        ? "Lightning fast reflexes!"
        : wordsCompleted >= 10
          ? "Good speed training!"
          : "Keep practicing your speed!"
    }
    if (menu.missionType === "LEFT_HAND") {
      return wordsCompleted >= 10
        ? "Left hand mastery achieved!"
        : wordsCompleted >= 5
          ? "Good left hand progress!"
          : "Keep training your left hand!"
    }
    if (menu.missionType === "RIGHT_HAND") {
      return wordsCompleted >= 10
        ? "Right hand mastery achieved!"
        : wordsCompleted >= 5
          ? "Good right hand progress!"
          : "Keep training your right hand!"
    }
    return wordsCompleted >= 10
      ? "Excellent work, Space Commander!"
      : wordsCompleted >= 5
        ? "Good job, Cadet!"
        : "Keep practicing, Recruit!"
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
        {status === "menu" && (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20 text-center max-w-md">
              <h1 className="text-4xl font-bold mb-4 text-primary animate-glow">Space Typer</h1>
              <p className="text-muted-foreground mb-6">Choose your training mission:</p>

              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => menu.setMissionType("WORDS")}
                  variant={menu.missionType === "WORDS" ? "default" : "outline"}
                  className="w-full"
                >
                  Main Mission (Words)
                </Button>
                <Button
                  onClick={() => menu.setMissionType("LEFT_HAND")}
                  variant={menu.missionType === "LEFT_HAND" ? "default" : "outline"}
                  className="w-full"
                >
                  Left Hand Training
                </Button>
                <Button
                  onClick={() => menu.setMissionType("RIGHT_HAND")}
                  variant={menu.missionType === "RIGHT_HAND" ? "default" : "outline"}
                  className="w-full"
                >
                  Right Hand Training
                </Button>
                <Button
                  onClick={() => menu.setMissionType("TIMED_TYPING")}
                  variant={menu.missionType === "TIMED_TYPING" ? "default" : "outline"}
                  className="w-full"
                >
                  Timed Typing
                </Button>
              </div>

              {isTimed && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Time per word (seconds):</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {menu.timeOptions.map((time) => (
                      <Button
                        key={time}
                        onClick={() => menu.handlePresetTimeSelect(time)}
                        variant={menu.wordTimeLimit === time && !menu.isUsingCustomTime ? "default" : "outline"}
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
                        value={menu.customTimeInput}
                        onChange={(e) => menu.handleCustomTimeChange(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span className="text-sm text-muted-foreground">seconds</span>
                    </div>
                    {menu.isUsingCustomTime && (
                      <p className="text-xs text-primary">Using custom time: {menu.wordTimeLimit}s</p>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={startGame}
                className="bg-primary hover:bg-primary/80 text-primary-foreground w-full"
              >
                Start Mission
              </Button>
            </Card>
          </div>
        )}

        {status === "playing" && (
          <div className="flex-1 flex flex-col">
            <GameInterface
              currentWord={currentWord}
              typedText={typedText}
              timeLeft={activeTimeLeft}
              score={score}
              wordsCompleted={wordsCompleted}
              totalTime={totalTime}
            />
          </div>
        )}

        {status === "gameOver" && (
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
                    {isTimed ? "N/A" : (wordsCompleted / (GAME_TIME - timeLeft)).toFixed(1)}
                  </span>
                </p>
                <p className="text-lg">
                  Mistakes Rate:{" "}
                  <span className="text-destructive font-bold">
                    {totalKeystrokes > 0 ? ((totalMistakes / totalKeystrokes) * 100).toFixed(1) : 0}%
                  </span>
                </p>
                <p className="text-muted-foreground">{getRankMessage()}</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={startGame}
                  className="bg-primary hover:bg-primary/80 text-primary-foreground w-full"
                >
                  Try Again
                </Button>
                <Button onClick={goToMenu} variant="outline" className="w-full">
                  Change Mission
                </Button>
              </div>
            </Card>
          </div>
        )}

        {status === "playing" && (
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
