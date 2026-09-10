import { useState, useEffect, useRef, useCallback } from 'react';
import {
    CheckMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClosedDocumentIcon,
    ClosedEyeIcon,
    MoonIcon,
    OpenDocumentIcon,
    OpenEyeIcon,
    SunIcon,
    UploadFileIcon,
} from './Icons';
import defaultWords from '../words/default_10.json';

export interface CardItem {
    trad: string;
    simp: string;
    jyutping: string;
    pinyin: string;
    en: string;
    zh: string;
}

export const shuffleCardItems = (words: CardItem[]): CardItem[] => {
    let list = [];
    while (list.length < words.length) {
        for (let w of words) {
            if (list.length >= words.length) break;
            list.push({ ...w });
        }
    }
    // Shuffle
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
};

export function useVisualViewport() {
    const [height, setHeight] = useState<number | null>(null);

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const handler = () => {
            setHeight(vv.height);
            // On iOS, when keyboard opens, visualViewport.height shrinks.
            // Scroll the page back to top so nothing gets clipped.
            if (vv.height < window.innerHeight * 0.75) {
                window.scrollTo(500, 0);
            }
        };

        vv.addEventListener('resize', handler);
        vv.addEventListener('scroll', handler);
        return () => {
            vv.removeEventListener('resize', handler);
            vv.removeEventListener('scroll', handler);
        };
    }, []);

    return height;
}

function FlashCardCN() {
    const [cards, setCards] = useState<CardItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [inputMatched, setInputMatched] = useState(false);
    const [inputMatchedPinyins, setInputMatchedPinyins] = useState<boolean[]>(
        []
    );
    const [inputMatchedJyutpings, setInputMatchedJyutpings] = useState<
        boolean[]
    >([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [descriptionVisible, setDescriptionVisible] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const [isThemeDark, setIsThemeDark] = useState(() => {
        const hours = new Date().getHours();
        return hours >= 18 || hours < 6;
    });
    const vvHeight = useVisualViewport();

    const currentCard = cards[currentIndex] || null;
    const totalCards = cards.length;
    const currentCardTrads = currentCard?.trad.split('');
    const currentCardJyutpings = currentCard?.jyutping.split(/ +/);
    const currentCardSimps = currentCard?.simp.split('');
    const currentCardPinyins = currentCard?.pinyin.split(/ +/);

    const speak = useCallback(
        ({
            text,
            lang,
            rate,
        }: {
            text: string;
            lang: string;
            rate?: number;
        }): void => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate ?? 0.9;
            speechSynthesis.speak(utterance);
        },
        []
    );

    const speakJyutping = useCallback(() => {
        if (!currentCard) return;
        speak({ text: currentCard.trad, lang: 'zh-HK' });
    }, [currentCard]);

    const speakPinyin = useCallback(() => {
        if (!currentCard) return;
        speak({ text: currentCard.simp, lang: 'zh-CN', rate: 0.6 });
    }, [currentCard]);

    const speakEnglish = useCallback(() => {
        if (!currentCard) return;
        speak({ text: currentCard.en, lang: 'en-US', rate: 0.9 });
    }, [currentCard]);

    const handlePopupKeyboardFocus = () => {
        inputRef.current?.focus();
    };

    const handlePopupKeyboardPreventScroll = (
        e: React.FocusEvent<HTMLInputElement>
    ) => {
        e.target.focus({ preventScroll: true });
    };

    const toggleRevealPhonetic = useCallback(() => {
        setRevealed((prev) => !prev);
    }, []);

    const toggleRevealDescription = useCallback(() => {
        setDescriptionVisible((prev) => !prev);
    }, []);

    const toggleIsThemeDark = useCallback(() => {
        setIsThemeDark((prev) => !prev);
    }, []);

    const goToPrevCard = useCallback(() => {
        if (totalCards === 0) return;
        if (inputMatched) {
            setRevealed(false);
        }
        setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
        setInputValue('');
        setInputMatched(false);
        setInputMatchedJyutpings([]);
        setInputMatchedPinyins([]);
    }, [
        totalCards,
        inputMatched,
        setInputMatchedJyutpings,
        setInputMatchedPinyins,
        setRevealed,
        setInputValue,
    ]);

    const goToNextCard = useCallback(() => {
        if (totalCards === 0) return;
        if (inputMatched) {
            setRevealed(false);
        }
        setCurrentIndex((prev) => (prev + 1) % totalCards);
        setInputValue('');
        setInputMatched(false);
        setInputMatchedJyutpings([]);
        setInputMatchedPinyins([]);
    }, [
        totalCards,
        inputMatched,
        setInputMatchedJyutpings,
        setInputMatchedPinyins,
        setInputValue,
        setRevealed,
    ]);

    const verifyInput = useCallback(
        (
            input: string,
            answer: string,
            setAnswerMatchedListCallback: React.Dispatch<
                React.SetStateAction<boolean[]>
            >
        ): void => {
            const inputList = input.toLowerCase().match(/[a-zA-Z]+\d*/g);
            const answerList = answer.toLowerCase().split(/ +/);
            const answerWithoutToneList = answer
                .replace(/\d/g, '')
                .toLowerCase()
                .split(/ +/);

            const answerMatchedList = answerList?.map(
                (answer, i) =>
                    answer == inputList?.[i] ||
                    answerWithoutToneList[i] == inputList?.[i]
            );
            const answerMatched =
                answerMatchedList.every((a) => a === true) ?? false;

            setAnswerMatchedListCallback(answerMatchedList);
            if (answerMatched) {
                setInputMatched(true);
                if (!revealed) {
                    setRevealed(true);
                }
            } else {
                setInputMatched(false);
                if (revealed) {
                    setRevealed(false);
                }
            }
        },
        [currentCard, revealed, setInputMatched]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = String(e.target.value ?? '');
            setInputValue(value);
            verifyInput(value, currentCard.jyutping, setInputMatchedJyutpings);
            verifyInput(value, currentCard.pinyin, setInputMatchedPinyins);
        },
        [
            currentCard,
            setInputValue,
            verifyInput,
            setInputMatchedJyutpings,
            setInputMatchedPinyins,
        ]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                speakJyutping();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                speakPinyin();
                return;
            }
            if (e.key === '/') {
                e.preventDefault();
                toggleRevealPhonetic();
                return;
            }
            if (e.key === '?') {
                e.preventDefault();
                toggleRevealDescription();
                return;
            }
            if (
                e.key === 'ArrowLeft' &&
                (inputValue.length == 0 ||
                    inputMatchedJyutpings ||
                    inputMatchedPinyins)
            ) {
                e.preventDefault();
                goToPrevCard();
                return;
            }
            if (
                e.key === 'ArrowRight' &&
                (inputValue.length == 0 ||
                    (inputValue.length > 0 && inputMatchedJyutpings) ||
                    (inputValue.length > 0 && inputMatchedPinyins))
            ) {
                e.preventDefault();
                if (
                    (inputValue.length > 0 && inputMatchedJyutpings) ||
                    (inputValue.length > 0 && inputMatchedPinyins)
                ) {
                    setRevealed(false);
                }
                goToNextCard();
                return;
            }
            if (
                e.key === 'Enter' &&
                (inputValue.length == 0 ||
                    inputMatchedJyutpings ||
                    inputMatchedPinyins)
            ) {
                e.preventDefault();
                setRevealed(false);
                goToNextCard();
            }
        },
        [
            speakJyutping,
            speakPinyin,
            toggleRevealPhonetic,
            toggleRevealDescription,
            goToPrevCard,
            goToNextCard,
            inputMatchedJyutpings,
            inputMatchedPinyins,
            inputValue,
        ]
    );

    const handleUploadFileIcon = () => {
        fileInputRef.current?.click();
    };

    const handleUploadFile = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const parsedCards: CardItem[] = JSON.parse(content);

                    if (Array.isArray(parsedCards) && parsedCards.length > 0) {
                        setCards(parsedCards);
                        setCurrentIndex(0);
                        setInputValue('');
                        setInputMatched(false);
                        setInputMatchedJyutpings([]);
                        setInputMatchedPinyins([]);
                    }
                } catch (err) {
                    console.error('Failed to parse uploaded JSON file', err);
                }
            };

            reader.readAsText(file);

            // Reset input so re-uploading the same file triggers onChange again
            e.target.value = '';
        },
        []
    );

    // Swipe handlers
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === 0) return;
        const end = e.changedTouches[0];
        const dx = end.clientX - touchStartX.current;
        const dy = end.clientY - touchStartY.current;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            if (dx < 0) goToNextCard();
            else goToPrevCard();
        }
        touchStartX.current = 0;
    };

    // Initialize cards
    useEffect(() => {
        const initialCards = shuffleCardItems(defaultWords);
        const randomIndex = Math.floor(Math.random() * initialCards.length);

        setCards(initialCards);
        setCurrentIndex(randomIndex);
    }, []);

    // Global keyboard listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (isThemeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isThemeDark]);

    if (!currentCard) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-gray-600 dark:text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="words-fash-card-container"
            className="flex min-h-dvh items-center justify-center bg-gray-50 p-3 transition-colors dark:bg-gray-900"
            style={{
                minHeight: vvHeight ? `${vvHeight}px` : '100dvh',
            }}
        >
            {/* Card */}
            <div
                data-testid="words-card-container"
                ref={cardRef}
                className="relative w-full max-w-2xl touch-pan-y rounded-3xl bg-white p-6 shadow-lg transition-colors sm:p-8 dark:bg-gray-800"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* float left buttons */}
                <div
                    data-testid="floating-left-buttons"
                    className="absolute top-1 left-3 text-gray-700 dark:text-gray-400"
                >
                    <div className="full-width flex flex-col content-around items-stretch gap-2">
                        <button
                            data-testid="upload-file-button"
                            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => {
                                handleUploadFileIcon();
                                handlePopupKeyboardFocus();
                            }}
                        >
                            <UploadFileIcon />
                            {/* Hidden File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.csv"
                                className="hidden"
                                onChange={handleUploadFile}
                            />
                        </button>
                        <button
                            data-testid="words-is-theme-dark-button"
                            onClick={() => {
                                toggleIsThemeDark();
                                handlePopupKeyboardFocus();
                            }}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {isThemeDark ? <MoonIcon /> : <SunIcon />}
                        </button>
                        <div
                            data-testid="words-progress-status-label"
                            className="self-center py-2 text-center text-sm font-medium text-gray-300 dark:border-gray-700 dark:text-gray-300"
                        >
                            {currentIndex + 1} / {totalCards}
                        </div>
                    </div>
                </div>

                {/* float right buttons */}
                <div
                    data-testid="floating-right-buttons"
                    className="absolute top-1 right-3 text-gray-700 dark:text-gray-400"
                >
                    <div className="full-width flex flex-col content-around items-stretch gap-2">
                        <button
                            data-testid="reveal-description-button"
                            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => {
                                toggleRevealDescription();
                                handlePopupKeyboardFocus();
                            }}
                        >
                            {descriptionVisible ? (
                                <OpenDocumentIcon />
                            ) : (
                                <ClosedDocumentIcon />
                            )}
                        </button>

                        <button
                            data-testid="reveal-phonetic-button"
                            onClick={() => {
                                handlePopupKeyboardFocus();
                                toggleRevealPhonetic();
                            }}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            aria-label="Toggle pronunciation"
                        >
                            {revealed ? <OpenEyeIcon /> : <ClosedEyeIcon />}
                        </button>
                    </div>
                </div>

                {/* Chinese characters */}
                <div
                    data-testid="words-chinese-container"
                    className="flex flex-col items-center gap-3 py-2"
                >
                    {/* Traditional */}
                    <div
                        data-testid="words-traditional-label"
                        className="flex w-full flex-col items-center"
                        onClick={() => {
                            speakJyutping();
                            handlePopupKeyboardFocus();
                        }}
                    >
                        <div className="flex gap-1">
                            {currentCardTrads.map((word, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-1"
                                    >
                                        <div
                                            data-testid={`words-trad-text-${i}`}
                                            className={`cursor-pointer text-center text-[2.5rem] font-medium text-gray-800 sm:text-6xl dark:text-gray-200`}
                                        >
                                            {word}
                                        </div>
                                        <div
                                            data-testid={`words-trad-phonetic-${i}`}
                                            className={`wrap-break-words text-center text-[0.7rem] text-gray-600 transition-opacity sm:text-lg dark:text-gray-400 ${inputMatchedJyutpings[i] || revealed ? 'opacity-100' : 'opacity-0'} ${inputMatchedJyutpings[i] ? 'rounded-md bg-green-500 text-white' : 'text-gray-800'}`}
                                        >
                                            {currentCardJyutpings[i]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Simplified */}
                    <div
                        data-testid="words-simplified-label"
                        className="flex w-full flex-col items-center"
                        onClick={() => {
                            speakPinyin();
                            handlePopupKeyboardFocus();
                        }}
                    >
                        <div className="flex gap-1">
                            {currentCardSimps.map((word, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-1"
                                    >
                                        <div
                                            data-testid={`words-simp-text-${i}`}
                                            className="cursor-pointer text-center text-[2.5rem] font-medium text-gray-800 sm:text-6xl dark:text-gray-200"
                                        >
                                            {word}
                                        </div>
                                        <div
                                            data-testid={`words-simp-phonetic-${i}`}
                                            className={`wrap-break-words text-center text-[0.7rem] text-gray-600 transition-opacity sm:text-lg dark:text-gray-400 ${inputMatchedPinyins[i] || revealed ? 'opacity-100' : 'opacity-0'} ${inputMatchedPinyins[i] ? 'rounded-md bg-green-500 text-white' : 'text-gray-800'}`}
                                        >
                                            {currentCardPinyins[i]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div
                    data-testid="words-description-label"
                    className={`text-center text-gray-500 dark:border-gray-700 dark:text-gray-300 ${descriptionVisible ? 'visible' : 'invisible'}`}
                    onClick={() => {
                        speakEnglish();
                        handlePopupKeyboardFocus();
                    }}
                >
                    {currentCard.en}
                </div>

                {/* Input row */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                    <button
                        data-testid="prev-words-card-button"
                        onClick={() => {
                            goToPrevCard();
                            handlePopupKeyboardFocus();
                        }}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        aria-label="Previous"
                    >
                        <ChevronLeftIcon />
                    </button>

                    <div className="flex min-w-35 flex-1 items-center rounded-full border border-gray-300 bg-gray-100 px-4 transition-colors focus-within:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:focus-within:border-gray-500">
                        <input
                            data-testid="words-input-box"
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                handleInputChange(e);
                            }}
                            onFocus={handlePopupKeyboardPreventScroll}
                            placeholder="Jyutping / Pinyin"
                            className="min-w-15 flex-1 bg-transparent py-3 text-base text-gray-800 outline-none dark:text-gray-200"
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="off"
                            spellCheck="false"
                        />
                        <CheckMarkIcon
                            data-testid="words-check-mark-icon"
                            matched={
                                (inputMatchedJyutpings.length > 0 &&
                                    inputMatchedJyutpings.every(
                                        (a) => a === true
                                    )) ||
                                (inputMatchedPinyins.length > 0 &&
                                    inputMatchedPinyins.every(
                                        (a) => a === true
                                    ))
                            }
                        />
                    </div>

                    <button
                        data-testid="next-words-card-button"
                        onClick={() => {
                            goToNextCard();
                            handlePopupKeyboardFocus();
                        }}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        aria-label="Next"
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FlashCardCN;
