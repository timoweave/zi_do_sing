import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    CheckMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClosedEyeIcon,
    OpenEyeIcon,
    UploadFileIcon,
} from './Icons';
import defaultWords from '../words/news_100b.json';

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
    const [width, setWidth] = useState<number | null>(null);

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const handler = () => {
            setHeight(vv.height);
            setWidth(vv.width);
            // On iOS, when keyboard opens, visualViewport.height shrinks.
            // Scroll the page back to top so nothing gets clipped.
            if (vv.height < window.innerHeight * 0.75) {
                const keyboardHeight = window.innerHeight - vv.height;
                window.scrollBy(0, -keyboardHeight);
            }
        };

        // const _updateHeight = () => {
        //     // Get the root element or fallback to document element
        //     const rootElement =
        //         document.getElementById('root') || document.documentElement;
        //     // Set the height explicitly to match the visible virtual viewport height in pixels
        //     rootElement.style.height = `${vv.height}px`;
        // };

        vv.addEventListener('resize', handler);
        vv.addEventListener('scroll', handler);
        handler();

        return () => {
            vv.removeEventListener('resize', handler);
            vv.removeEventListener('scroll', handler);
        };
    }, []);

    return [width, height];
}

const speak = ({
    text,
    lang,
    rate,
}: {
    text: string;
    lang?: string;
    rate?: number;
}): void => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang ?? 'en-US';
    utterance.rate = rate ?? 0.9;
    speechSynthesis.speak(utterance);
};

export interface WordAndSound {
    word: string;
    sound: string;
    ith: number;
    isAllMatched: boolean;
    isWordMatched: boolean;
    isSoundMatched: boolean;
    isAllSoundRevealed: boolean;
}

function WordAndSound({
    word,
    sound,
    ith,
    isAllSoundRevealed,
    isAllMatched, // either all text or all sound
    isSoundMatched,
    isWordMatched,
}: WordAndSound) {
    return (
        <div
            data-testid={`traditional-jyuting-${ith}`}
            className={`flex flex-col pt-1 ${(isSoundMatched || isWordMatched) && !isAllMatched ? 'rounded-md bg-gray-600' : 'text-gray-800'}`}
        >
            {/* char */}
            <div
                data-testid={`words-trad-text-${ith}`}
                className={`cursor-pointer pt-1 text-center text-[2.5rem] leading-none font-medium text-gray-800 dark:text-gray-200`}
            >
                {word}
            </div>
            {/* sound */}
            <div
                data-testid={`words-trad-phonetic-${ith}`}
                className={`wrap-break-words text-center text-[0.6rem] text-gray-600 transition-opacity dark:text-gray-200 ${isSoundMatched || isAllSoundRevealed ? 'opacity-100' : 'opacity-0'} `}
            >
                {sound}
            </div>
        </div>
    );
}

interface WordsAndSounds {
    words: string[];
    sounds: string[];
    isWordsMatched: boolean[];
    isSoundMatched: boolean[];
    speakSound: () => void;
}

function FlashCardCN() {
    const [cards, setCards] = useState<CardItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tradIndex, setTradIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [inputMatched, setInputMatched] = useState(false);
    const [inputMatchedPinyins, setInputMatchedPinyins] = useState<boolean[]>(
        []
    );
    const [inputMatchedJyutpings, setInputMatchedJyutpings] = useState<
        boolean[]
    >([]);
    const [inputMatchedTrads /* setInputMatchedTradls */] = useState<boolean[]>(
        []
    );
    const [inputMatchedSimpls /* setInputMatchedSimpls */] = useState<
        boolean[]
    >([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [descriptionVisible, setDescriptionVisible] = useState(true);

    const inputRowRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef(null);
    const scrollableChineseWordsRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const [isThemeDark, _setIsThemeDark] = useState(true);
    const [_vvWidth, vvHeight] = useVisualViewport();

    console.log(navigator.userAgent);
    const currentCard = useMemo(
        () => cards[currentIndex] || null,
        [cards, currentIndex]
    );
    const totalCards = cards.length;
    const currentCardTrads = currentCard?.trad.split('');
    const currentCardJyutpings = currentCard?.jyutping.split(/ +/);
    const currentCardSimps = currentCard?.simp.split('');
    const currentCardPinyins = currentCard?.pinyin.split(/ +/);

    const isPopupKeyboardOpenProbably = () => {
        const viewport = window.visualViewport;
        const viewportShrunk =
            !!viewport && viewport.height < window.innerHeight * 0.75;
        const textInputHasFocus = document.activeElement === inputRef.current;

        return viewportShrunk || textInputHasFocus;
    };

    const handlePopupKeyboardBlur = () => {
        if (!isPopupKeyboardOpenProbably()) {
            inputRef.current?.blur();
        }
    };

    const stopPropagation = (e: React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const preventDefault = (
        e: React.MouseEvent<HTMLButtonElement | HTMLDivElement> | KeyboardEvent
    ): void => {
        e.preventDefault();
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

    const verifyInputPhonetic = useCallback(
        (
            input: string,
            answer: string,
            setAnswerMatchedListCallback: React.Dispatch<
                React.SetStateAction<boolean[]>
            >
        ): boolean => {
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
                    return true;
                }
            } else {
                setInputMatched(false);
                if (revealed) {
                    setRevealed(false);
                    return false;
                }
            }
            return false;
        },
        [currentCard, revealed, setInputMatched]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = String(e.target.value ?? '');
            setInputValue(value);
            interface ExpectedPhoneticAndSetMatchedPhonetic {
                expectedPhonetic: string;
                setMatchedPhonetic: React.Dispatch<
                    React.SetStateAction<boolean[]>
                >;
            }

            const checkList: ExpectedPhoneticAndSetMatchedPhonetic[] = [
                {
                    expectedPhonetic: currentCard.jyutping,
                    setMatchedPhonetic: setInputMatchedJyutpings,
                },
                {
                    expectedPhonetic: currentCard.pinyin,
                    setMatchedPhonetic: setInputMatchedPinyins,
                },
            ];
            checkList.some((check) => {
                const {
                    expectedPhonetic: answerPhonetic,
                    setMatchedPhonetic: setInputMatchedPhonetic,
                } = check;
                return verifyInputPhonetic(
                    value,
                    answerPhonetic,
                    setInputMatchedPhonetic
                );
            });
        },
        [
            currentCard,
            inputMatched,
            setInputValue,
            verifyInputPhonetic,
            setInputMatchedJyutpings,
            setInputMatchedPinyins,
        ]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const isInputEmpty = inputValue.length == 0;
            if (e.key === 'ArrowUp' && e.shiftKey && !isInputFocused) {
                e.preventDefault();
                speak({ text: currentCard.trad, lang: 'zh-HK' });
                return;
            }
            if (e.key === 'ArrowDown' && e.shiftKey && !isInputFocused) {
                e.preventDefault();
                speak({ text: currentCard.simp, lang: 'zh-CN' });
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
            if (e.key === 'ArrowLeft' && isInputEmpty) {
                e.preventDefault();
                if (inputMatched) {
                    setRevealed(false);
                }
                goToPrevCard();
                return;
            }
            if (e.key === 'ArrowRight' && isInputEmpty) {
                e.preventDefault();
                if (inputMatched) {
                    setRevealed(false);
                }
                goToNextCard();
                return;
            }
            if (e.key === 'Enter' && inputMatched && !isInputEmpty) {
                e.preventDefault();
                setRevealed(false);
                goToNextCard();
                scrollToStart();
            }
        },
        [
            currentCard,
            speak,
            toggleRevealPhonetic,
            toggleRevealDescription,
            goToPrevCard,
            goToNextCard,
            inputMatched,
            inputMatchedJyutpings,
            inputMatchedPinyins,
            inputValue,
            isInputFocused,
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

    const scroll = () => {
        if (
            scrollableChineseWordsRef.current == null ||
            currentCard.trad == null
        ) {
            return;
        }

        const el = scrollableChineseWordsRef.current;
        const tradLength = currentCard.trad.trim().split('').length;
        const tradIndexCharacterSize = el.scrollWidth / tradLength;
        const tradIndexLength = Math.floor(
            el.clientWidth / tradIndexCharacterSize
        );
        const movePosition = (tradIndex + 1) * tradIndexCharacterSize;

        if (
            tradIndex !==
            tradIndexLength * (Math.floor(tradIndex / tradIndexLength) + 1) - 1
        ) {
            return;
        }

        el.scrollTo({ left: movePosition, behavior: 'smooth' });
    };

    const scrollToStart = () => {
        scrollableChineseWordsRef.current?.scrollTo({
            left: 0,
            behavior: 'smooth',
        });
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

    useEffect(() => {
        if (scrollableChineseWordsRef.current) {
            scrollableChineseWordsRef.current?.scrollTo({
                left: 0,
                behavior: 'auto',
            });
        }
    }, [currentCard?.trad]);

    useEffect(() => {
        setTradIndex(
            (inputRef.current?.value.trim().split(/ +/).length ?? 1) - 1
        );
    }, [inputRef.current?.value]);

    useEffect(() => {
        const inputMatchedJyutpingsAll =
            inputValue.length > 0 &&
            inputMatchedJyutpings.every((a) => a === true);
        const inputMatchedPinyinsAll =
            inputValue.length > 0 &&
            inputMatchedPinyins.every((a) => a === true);
        const inputMatchedPhonetic =
            inputMatchedJyutpingsAll || inputMatchedPinyinsAll;
        setInputMatched(inputMatchedPhonetic);
    }, [inputValue]);

    if (!currentCard) {
        return (
            <div
                className="flex min-h-dvh items-center justify-center bg-gray-50 dark:bg-gray-900"
                // className="flex h-dvh w-screen items-center justify-center bg-gray-50 dark:bg-gray-900"
            >
                <div className="text-gray-600 dark:text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    const wordsAndSounds: WordsAndSounds[] = [
        {
            words: currentCardTrads,
            sounds: currentCardJyutpings,
            isWordsMatched: inputMatchedTrads,
            isSoundMatched: inputMatchedJyutpings,
            speakSound: () => speak({ text: currentCard.trad, lang: 'zh-HK' }),
        },
        {
            words: currentCardSimps,
            sounds: currentCardPinyins,
            isWordsMatched: inputMatchedSimpls,
            isSoundMatched: inputMatchedPinyins,
            speakSound: () => speak({ text: currentCard.simp, lang: 'zh-CN' }),
        },
    ];

    return (
        /* Card Deck */
        <div
            id="words-flash-card-deck-container"
            data-testid="words-flash-card-deck-container"
            className="font-cn-fontsource-975-maru-sc m-v-4 flex min-h-dvh w-full flex-col items-center justify-center gap-2 bg-gray-50 p-4 transition-colors dark:bg-gray-900"
            style={{
                minHeight: vvHeight ? `${vvHeight}px` : '100dvh',
            }}
            // className="font-cn-fontsource-975-maru-sc m-v-4 flex h-dvh w-screen flex-col items-center justify-center gap-2 bg-gray-50 p-4 transition-colors dark:bg-gray-900"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Card */}
            <div
                id="words-flash-card-container"
                data-testid="words-flash-card-container"
                ref={cardRef}
                className="relative flex w-full max-w-120 touch-pan-y flex-col place-content-around rounded-3xl bg-white p-6 shadow-lg transition-colors dark:bg-gray-800"
            >
                {/* Chinese characters rows container */}
                <div
                    ref={scrollableChineseWordsRef}
                    data-testid="words-chinese-scrollable-container"
                    className="[&::-webkit-scrollbar] flex flex-row items-center gap-2 overflow-x-auto px-0 py-2 pb-2 whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700"
                    onTouchStart={stopPropagation}
                    onTouchEnd={stopPropagation}
                >
                    <div
                        data-testid="words-chinese-container"
                        className="mx-auto flex flex-col items-center justify-center gap-1"
                    >
                        {wordsAndSounds.map((wordAndSound, row) => (
                            <div
                                key={row}
                                data-testid={`words-traditional-label-${row}`}
                                className="flex flex-col items-center gap-1"
                                onDoubleClick={() => {
                                    wordAndSound.speakSound();
                                    // handlePopupKeyboardBlur();
                                }}
                                onMouseDown={preventDefault}
                            >
                                {/* Chinese characters row i-th */}
                                <div
                                    className={`${inputMatched && wordAndSound.isSoundMatched.every((a) => a == true) ? 'rounded-md bg-gray-600' : ''} flex gap-1`}
                                >
                                    {wordAndSound.words.map((word, i) => {
                                        const key =
                                            /* TBD: react need help to redraw when revealed is changed */
                                            100 * Number(revealed) +
                                            10 * row +
                                            i;
                                        const sound = wordAndSound.sounds[i];
                                        const isCharMatched =
                                            wordAndSound.isWordsMatched[i];
                                        const isSoundMatched =
                                            wordAndSound.isSoundMatched[i];

                                        return (
                                            <WordAndSound
                                                key={key}
                                                ith={i}
                                                word={word}
                                                sound={sound}
                                                isAllMatched={inputMatched}
                                                isWordMatched={isCharMatched}
                                                isSoundMatched={isSoundMatched}
                                                isAllSoundRevealed={revealed}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div
                    data-testid="words-description-label"
                    className={`overflow-x-auto text-center whitespace-nowrap text-gray-500 dark:border-gray-700 dark:text-gray-300 ${descriptionVisible ? 'visible' : 'invisible'}`}
                    onMouseDown={preventDefault}
                    onTouchStart={stopPropagation}
                    onTouchEnd={stopPropagation}
                >
                    {currentCard.en}
                </div>
            </div>

            {/* Pagination */}
            <div
                id="words-progress-status-label"
                data-testid="words-progress-status-label"
                className="flex justify-center self-center py-1 text-center text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
            >
                {currentIndex + 1} / {totalCards}
            </div>

            {/* Input row */}
            <div
                ref={inputRowRef}
                data-testid="words-input-row"
                className="flex w-full max-w-120 flex-wrap items-center justify-center gap-1"
                // className="pb-safe flex w-full max-w-120 shrink-0 flex-wrap items-center justify-center gap-1"
            >
                {/* left chevron */}
                <button
                    data-testid="previous-words-card-button"
                    title="go to previous card"
                    onClick={() => {
                        goToPrevCard();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Previous"
                >
                    <ChevronLeftIcon />
                </button>
                {/* upload file button */}
                <button
                    data-testid="upload-file-button-5"
                    title="select chinese word file"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                        handleUploadFileIcon();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                >
                    <UploadFileIcon />
                    {/* Hidden File Input */}
                    <input
                        id="upload-file-button-5-hidden-input"
                        data-testid="upload-file-button-5-hidden-input"
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleUploadFile}
                    />
                </button>
                {/* input combo line */}
                <div
                    data-testid="words-input-box-container"
                    className="flex flex-1 items-center rounded-full border border-gray-300 bg-gray-100 px-4 transition-colors focus-within:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:focus-within:border-gray-500"
                >
                    {/* input element */}
                    <input
                        title="type in jyutping, pinyin, or chinese"
                        id="words-input-box"
                        data-testid="words-input-box"
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            handleInputChange(e);
                            if (e.target.value.at(-1) == ' ') {
                                scroll();
                            }
                        }}
                        onFocus={(e) => {
                            handlePopupKeyboardPreventScroll(e);
                            setIsInputFocused(true);
                            console.log('focus');
                            if (inputRowRef.current && isInputFocused) {
                                inputRowRef.current.style.opacity = '0%';
                            }
                        }}
                        onBlur={() => {
                            setIsInputFocused(false);
                            console.log('blur');
                            if (inputRowRef.current && isInputFocused) {
                                inputRowRef.current.style.opacity = '100%';
                            }
                        }}
                        placeholder="Jyutping / Pinyin"
                        className="flex w-full flex-1 bg-transparent py-1 text-base text-gray-800 outline-none dark:text-gray-200"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <div
                        onClick={() => {
                            handlePopupKeyboardBlur();
                        }}
                    >
                        <CheckMarkIcon
                            data-testid="words-check-mark-icon"
                            matched={inputMatched}
                        />
                    </div>
                </div>
                {/* reveal phonetic */}
                <button
                    data-testid="reveal-phonetic-button"
                    title="reveal phonetic"
                    onClick={() => {
                        toggleRevealPhonetic();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Toggle pronunciation"
                >
                    {revealed ? <OpenEyeIcon /> : <ClosedEyeIcon />}
                </button>
                {/* right chevron */}
                <button
                    data-testid="next-words-card-button"
                    title="go to next card"
                    onClick={() => {
                        goToNextCard();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Next"
                >
                    <ChevronRightIcon />
                </button>
            </div>
        </div>
    );
}

export default FlashCardCN;
