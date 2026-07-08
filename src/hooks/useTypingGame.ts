import { useCallback, useEffect, useMemo, useState } from 'react';
import { WORDS, LEFT_HAND, RIGHT_HAND } from '@/lib/dictionary';

export const GAME_TIME = 30; // seconds
export type MissionType = 'WORDS' | 'LEFT_HAND' | 'RIGHT_HAND' | 'TIMED_TYPING';
export type GameStatus = 'menu' | 'playing' | 'gameOver';
export interface TypingGameConfig {
	missionType: MissionType;
	wordTimeLimit: number;
}

export interface TypingGame {
	status: GameStatus;
	currentWord: string;
	typedText: string;
	score: number;
	timeLeft: number;
	wordTimeLeft: number;
	wordsCompleted: number;
	totalKeystrokes: number;
	totalMistakes: number;
	isCapsLockOn: boolean;
	pressedKeys: Set<string>;
	nextCorrectKeyIndex: number;
	needsBackspace: boolean;
	startGame: () => void;
	endGame: () => void;
	goToMenu: () => void;
	handleKeyPress: (event: KeyboardEvent) => void;
}

const playErrorSound = () => {
	try {
		const AudioContextCtor =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		const audioContext = new AudioContextCtor();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();
		const vibrato = audioContext.createOscillator();
		const vibratoGain = audioContext.createGain();
		vibrato.frequency.value = 28; // Hz
		vibratoGain.gain.value = 22; // Hz of pitch deviation
		vibrato.connect(vibratoGain).connect(oscillator.frequency);

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.frequency.setValueAtTime(660, audioContext.currentTime); // Audible error beep
		oscillator.type = 'sine';

		gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

		oscillator.start(audioContext.currentTime);
		vibrato.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 0.1);
		vibrato.stop(audioContext.currentTime + 0.1);
	} catch {
		// Audio not supported
	}

	// Haptic feedback on devices that support vibration
	if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
		navigator.vibrate(40);
	}
};

export function useTypingGame({ missionType, wordTimeLimit }: TypingGameConfig): TypingGame {
	const [status, setStatus] = useState<GameStatus>('menu');
	const [currentWord, setCurrentWord] = useState('');
	const [typedText, setTypedText] = useState('');
	const [timeLeft, setTimeLeft] = useState(GAME_TIME);
	const [wordTimeLeft, setWordTimeLeft] = useState(1); // time left for current word
	const [score, setScore] = useState(0);
	const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
	const [wordsCompleted, setWordsCompleted] = useState(0);
	const [isCapsLockOn, setIsCapsLockOn] = useState(false);
	const [totalMistakes, setTotalMistakes] = useState(0);
	const [totalKeystrokes, setTotalKeystrokes] = useState(0);

	const getRandomWord = useCallback(() => {
		switch (missionType) {
			case 'LEFT_HAND':
				return LEFT_HAND[Math.floor(Math.random() * LEFT_HAND.length)];
			case 'RIGHT_HAND':
				return RIGHT_HAND[Math.floor(Math.random() * RIGHT_HAND.length)];
			default:
				return WORDS[Math.floor(Math.random() * WORDS.length)];
		}
	}, [missionType]);

	// Derives which key to press next and whether a backspace is required.
	const { nextCorrectKeyIndex, needsBackspace } = useMemo(() => {
		let nextIndex = typedText.length;
		let hasIncorrectCharacters = false;

		for (let i = 0; i < typedText.length; i++) {
			const expected = currentWord[i]?.toLowerCase();
			if (expected === undefined || typedText[i].toLowerCase() !== expected) {
				nextIndex = i;
				hasIncorrectCharacters = true;
				break;
			}
		}

		if (nextIndex >= currentWord.length) {
			nextIndex = Math.max(currentWord.length - 1, 0);
		}

		return { nextCorrectKeyIndex: nextIndex, needsBackspace: hasIncorrectCharacters };
	}, [typedText, currentWord]);

	const startGame = useCallback(() => {
		setStatus('playing');
		setCurrentWord(getRandomWord());
		setTypedText('');
		setTimeLeft(GAME_TIME);
		setWordTimeLeft(missionType === 'TIMED_TYPING' ? wordTimeLimit : GAME_TIME);
		setScore(0);
		setWordsCompleted(0);
		setPressedKeys(new Set());
		setTotalMistakes(0);
		setTotalKeystrokes(0);
	}, [getRandomWord, missionType, wordTimeLimit]);

	const endGame = useCallback(() => {
		setStatus('gameOver');
		setPressedKeys(new Set());
	}, []);

	const goToMenu = useCallback(() => {
		setStatus('menu');
		setPressedKeys(new Set());
	}, []);

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (status !== 'playing') return;

			const key = event.key.toLowerCase();

			if (key === 'capslock') {
				setIsCapsLockOn((prev) => !prev);
			}

			setPressedKeys((prev) => new Set(prev).add(key));
			setTimeout(() => {
				setPressedKeys((prev) => {
					const newSet = new Set(prev);
					newSet.delete(key);
					return newSet;
				});
			}, 200);

			if (key === 'backspace') {
				setTypedText((prev) => prev.slice(0, -1));
				setTotalKeystrokes((prev) => prev + 1);
			} else if (key.length === 1 && /[a-z]/.test(key)) {
				const isShiftPressed = event.shiftKey;
				const shouldBeUppercase = isShiftPressed !== isCapsLockOn;
				const characterToAdd = shouldBeUppercase ? key.toUpperCase() : key;

				const newTypedText = typedText + characterToAdd;
				setTotalKeystrokes((prev) => prev + 1);

				const currentPosition = typedText.length;
				if (currentPosition < currentWord.length) {
					const expectedChar = currentWord[currentPosition].toLowerCase();
					const typedChar = characterToAdd.toLowerCase();

					if (typedChar !== expectedChar) {
						playErrorSound();
						setTotalMistakes((prev) => prev + 1);
					}
				} else {
					playErrorSound();
					setTotalMistakes((prev) => prev + 1);
				}

				setTypedText(newTypedText);

				if (newTypedText.toLowerCase() === currentWord.toLowerCase()) {
					setScore((prev) => prev + currentWord.length * 10);
					setWordsCompleted((prev) => prev + 1);
					setCurrentWord(getRandomWord());
					setTypedText('');
					if (missionType === 'TIMED_TYPING') {
						setWordTimeLeft(wordTimeLimit);
					}
				}
			}
		},
		[status, typedText, currentWord, isCapsLockOn, getRandomWord, missionType, wordTimeLimit],
	);

	useEffect(() => {
		if (status !== 'playing') return;

		window.addEventListener('keydown', handleKeyPress);
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [status, handleKeyPress]);

	useEffect(() => {
		if (status !== 'playing') return;

		const isTimed = missionType === 'TIMED_TYPING';
		const timer = setTimeout(
			() => {
				if (isTimed) {
					if (wordTimeLeft > 0) {
						setWordTimeLeft((prev) => prev - 0.1);
					} else {
						endGame();
					}
				} else {
					if (timeLeft > 0) {
						setTimeLeft((prev) => prev - 1);
					} else {
						endGame();
					}
				}
			},
			isTimed ? 100 : 1000,
		);

		return () => clearTimeout(timer);
	}, [status, timeLeft, wordTimeLeft, missionType, endGame]);

	return {
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
		endGame,
		goToMenu,
		handleKeyPress,
	};
}

