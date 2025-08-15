interface VirtualKeyboardProps {
  pressedKeys: Set<string>
  isCapsLockOn: boolean
}

const KEYBOARD_LAYOUT = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
]

export default function VirtualKeyboard({ pressedKeys, isCapsLockOn }: VirtualKeyboardProps) {
  return (
    <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 shadow-lg">
      <div className="space-y-2">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => {
              const isPressed = pressedKeys.has(key)
              const displayKey = isCapsLockOn ? key.toUpperCase() : key

              return (
                <div
                  key={key}
                  className={`
                    w-8 h-8 rounded border flex items-center justify-center text-sm font-mono transition-all duration-200
                    ${
                      isPressed
                        ? "bg-primary text-primary-foreground border-primary shadow-lg scale-95"
                        : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary/70"
                    }
                  `}
                >
                  {displayKey}
                </div>
              )
            })}
          </div>
        ))}

        {/* Space bar */}
        <div className="flex justify-center mt-2">
          <div
            className={`
              w-32 h-8 rounded border flex items-center justify-center text-xs font-mono transition-all duration-200
              ${
                pressedKeys.has(" ")
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-95"
                  : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary/70"
              }
            `}
          >
            SPACE
          </div>
        </div>

        {/* Caps Lock indicator */}
        {isCapsLockOn && (
          <div className="flex justify-center mt-2">
            <div className="bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-mono">CAPS LOCK ON</div>
          </div>
        )}
      </div>
    </div>
  )
}
