# Space Typer

A space-themed typing trainer web game built with **React 19 + TypeScript + Vite**. Practice your typing speed and accuracy against a starfield backdrop, with a live 3D virtual keyboard that lights up the next key and highlights your home-row finger positions.

## Features

- **Four training missions:**
  - **Main Mission (Practice Words)** — type random words (space-themed + ~100 everyday words).
  - **Left Hand Training** — drills that use only left-hand keys (`q w e r t a s d f g z x c v b`).
  - **Right Hand Training** — drills that use only right-hand keys (`y u i o p h j k l n m`).
  - **Timed Typing** — race the clock with a configurable seconds-per-word limit (presets `0.2 / 0.3 / 0.6 / 1 / 2 / 3 / 5`s or a custom value up to 60s).
- **Live 3D virtual keyboard** (React Three Fiber) that shows:
  - the currently **pressed** key (purple glow),
  - the **next key** to press (cyan glow),
  - **home-row finger positions** for all resting fingers (green) — great for building muscle memory,
  - Caps Lock state and Shift symbol overlays.
- **Real-time feedback** while typing: correctly typed letters are highlighted green, mistakes red.
- **Stats & scoring:** score, words completed, time remaining, words-per-second, and a mistakes-rate percentage.

## Tech Stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | React 19, TypeScript                                          |
| Build tool     | Vite 7                                                        |
| 3D rendering   | `@react-three/fiber`, `@react-three/drei`, `three`            |
| Styling        | Tailwind CSS v4, `class-variance-authority`, `tailwind-merge` |
| UI primitives  | Radix UI (`progress`, `slot`), shadcn-style components        |
| Theme & fonts  | `next-themes`, Geist fonts (`geist`, `non.geist`)             |
| Linting        | ESLint 9 + TypeScript ESLint                                  |

## Project Structure

```
src/
├─ App.tsx                      # Game state machine (menu / playing / gameOver), word lists, key handling
├─ main.tsx                     # React entry point
├─ index.css                    # Tailwind + custom theme/animations (glow, twinkle, ...)
├─ lib/
│  ├─ dictionary.ts             # Word lists (WORDS, LEFT_HAND, RIGHT_HAND)
│  └─ utils.ts                  # cn() class-name helper
├─ components/
│  ├─ game-interface.tsx        # Word display + typing feedback + time progress bar
│  ├─ virtual-keyboard.tsx      # 3D keyboard, finger maps, key highlighting
│  ├─ theme-provider.tsx        # Theme context
│  └─ ui/                       # Card, Button, Progress (shadcn-style)
```

## Word Lists

- **`WORDS`** — 147 entries: 15 space-themed words + ~100 common everyday words for varied practice.
- **`LEFT_HAND`** — 50 patterns restricted to left-hand keys (home-row runs, diagonal reaches, single-key warmups, real left-hand words like `sweet`, `crater`, `reward`).
- **`RIGHT_HAND`** — 44 patterns restricted to right-hand keys (home-row runs, diagonal reaches, warmups, real right-hand words like `jump`, `lion`, `pony`).

Every entry in `LEFT_HAND` / `RIGHT_HAND` is validated to use only its respective hand's keys.

## Getting Started

```bash
# install dependencies (pnpm is used by the lockfile)
pnpm install

# start the dev server (http://localhost:5173)
pnpm dev

# type-check + production build
pnpm build

# preview the production build
pnpm preview

# lint
pnpm lint
```

Requires Node.js (the lockfile expects `@types/node` 22). Open the app in a browser, choose a mission, and start typing.

## How to Play

1. From the menu, pick a mission (and, for Timed Typing, a per-word time limit).
2. Click **Start Mission**. Type each displayed word before the timer runs out.
3. Watch the 3D keyboard: press the highlighted **next key**; green keys show where your other fingers should rest.
4. Mistakes play a beep and count toward your mistakes rate. Completing a word adds to your score.
5. When time expires, review your score, words-per-second, and accuracy, then retry or change mission.
