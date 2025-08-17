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

const GAME_TIME = 30 // seconds

export default function SpaceTypingGame() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu")
  const [currentWord, setCurrentWord] = useState("")
  const [typedText, setTypedText] = useState("")
  const [nextCorrectKeyIndex, setNextCorrectKeyIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [score, setScore] = useState(0)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  const getRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)]

  const startGame = () => {
    setGameState("playing")
    setCurrentWord(getRandomWord())
    setTypedText("")
    setTimeLeft(GAME_TIME)
    setScore(0)
    setWordsCompleted(0)
    setPressedKeys(new Set())
  }

  const endGame = () => {
    setGameState("gameOver")
    setPressedKeys(new Set())
  }

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
        });
        // for(let i = 0; i<typedText.length; i++){
        //   if(typedText[i] !== currentWord[i]){
        //       setNextKeyIndex(i);
        //     break;
        //   }
        // }
      }, 200)

      if (key === "backspace") {
        setTypedText((prev) => prev.slice(0, -1))
      } else if (key.length === 1 && /[a-z]/.test(key)) {
        const isShiftPressed = event.shiftKey
        const shouldBeUppercase = isShiftPressed !== isCapsLockOn
        const characterToAdd = shouldBeUppercase ? key.toUpperCase() : key

        const newTypedText = typedText + characterToAdd

        setTypedText(newTypedText)

        if (newTypedText.toLowerCase() === currentWord.toLowerCase()) {
          setScore((prev) => prev + currentWord.length * 10);
          setWordsCompleted((prev) => prev + 1);
          setCurrentWord(getRandomWord());
          setTypedText("");
          setNextKeyIndex(0);
        }
      }
    },
    [gameState, typedText, currentWord, isCapsLockOn],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress]);

  // if(typedText.length!==0){
  //   for(let i = 0; i<typedText.length; i++){
  //     if(typedText[i] !== currentWord[i]){
  //       setTimeout(() => {
  //         setNextKeyIndex(i);
  //       }, 50);
  //       break;
  //     }
  //   }
  // }


  // typedText.split('').forEach((char,index)=>{
  //   if(char === currentWord[nextKeyIndex]){
  //     setNextKeyIndex(index+1);
  //   }
  // });

  // for(let i = 0; i<typedText.length; i++){
  //   if(typedText[i] !== currentWord[i]){
  //     setNextKeyIndex(i);
  //     break;
  //   }
  // }
  // useEffect(()=>{
  //   for(let i = 0; i<typedText.length; i++){
  //     if(typedText[i] !== currentWord[i]){
  //       setNextKeyIndex(i);
  //       break;
  //     }
  //   }
  // },[typedText,currentWord]);

  // useEffect(() => {
  //   let interval: NodeJS.Timeout
  //   if (gameState === "playing" && timeLeft > 0) {
  //     interval = setInterval(() => {
  //       setTimeLeft((prev) => {
  //         if (prev <= 1) {
  //           endGame()
  //           return 0
  //         }
  //         return prev - 1
  //       })
  //     }, 1000)
  //   }
  //   return () => clearInterval(interval)
  // }, [gameState, timeLeft])

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
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20 text-center">
              <h1 className="text-4xl font-bold mb-4 text-primary animate-glow">Space Typer</h1>
              <p className="text-muted-foreground mb-6">Type the words as fast as you can before time runs out!</p>
              <Button onClick={startGame} className="bg-primary hover:bg-primary/80 text-primary-foreground">
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
                  {wordsCompleted >= 10
                    ? "Excellent work, Space Commander!"
                    : wordsCompleted >= 5
                      ? "Good job, Cadet!"
                      : "Keep practicing, Recruit!"}
                </p>
              </div>
              <Button onClick={startGame} className="bg-primary hover:bg-primary/80 text-primary-foreground">
                Try Again
              </Button>
            </Card>
          </div>
        )}

        {gameState === "playing" && (
          <div className="absolute bottom-4 bg-[#0f172a] left-0 right-0 px-4 -mb-16">
            <VirtualKeyboard pressedKeys={pressedKeys} isCapsLockOn={isCapsLockOn} nextKey={currentWord[nextKeyIndex]} />
          </div>
        )}
      </div>
    </div>
  )
}
