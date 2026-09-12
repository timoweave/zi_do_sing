import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    CheckMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClosedDocumentIcon,
    ClosedEyeIcon,
    DotDotDotIcon,
    MoonIcon,
    OpenDocumentIcon,
    OpenEyeIcon,
    SunIcon,
    UploadFileIcon,
} from './Icons';
import defaultWords from '../words/chats_100.json';

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

        vv.addEventListener('resize', handler);
        vv.addEventListener('scroll', handler);
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
    const [descriptionVisible, setDescriptionVisible] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef(null);
    const scrollableChineseWordsRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const [isThemeDark, setIsThemeDark] = useState(true);
    const [_vvWidth, vvHeight] = useVisualViewport();

    const currentCard = useMemo(
        () => cards[currentIndex] || null,
        [cards, currentIndex]
    );
    const totalCards = cards.length;
    const currentCardTrads = currentCard?.trad.split('');
    const currentCardJyutpings = currentCard?.jyutping.split(/ +/);
    const currentCardSimps = currentCard?.simp.split('');
    const currentCardPinyins = currentCard?.pinyin.split(/ +/);

    const speakJyutping = useCallback(() => {
        if (!currentCard) return;
        speak({ text: currentCard.trad, lang: 'zh-HK' });
    }, [currentCard]);

    const speakPinyin = useCallback(() => {
        if (!currentCard) return;
        speak({ text: currentCard.simp, lang: 'zh-CN', rate: 0.6 });
    }, [currentCard]);

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
            }
        },
        [
            speakJyutping,
            speakPinyin,
            toggleRevealPhonetic,
            toggleRevealDescription,
            goToPrevCard,
            goToNextCard,
            inputMatched,
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

    const scroll = () => {
        if (
            scrollableChineseWordsRef.current == null ||
            currentCard.trad == null
        ) {
            return;
        }
        const el = scrollableChineseWordsRef.current;
        const tradLength = currentCard.trad.trim().split('').length ?? 1;
        const tradIndexSize = (el.scrollWidth - el.clientWidth) / tradLength;

        const left = tradIndex * tradIndexSize;
        console.log(
            'left ',
            Math.round(left),
            'trad index',
            tradIndex,
            'trad index width',
            Math.round(tradIndexSize),
            'scroll width',
            Math.round(el.scrollWidth),
            'client width',
            Math.round(el.clientWidth)
        );

        el.scrollTo({ left, behavior: 'smooth' });
    };

    const scrollToStart = () => {
        scrollableChineseWordsRef.current?.scrollTo({
            left: 0,
            behavior: 'smooth',
        });
    };

    const scrollToMiddle = () => {
        const el = scrollableChineseWordsRef.current;
        if (el) {
            const middleLeft = (el.scrollWidth - el.clientWidth) / 2;
            el.scrollTo({ left: middleLeft, behavior: 'smooth' });
        }
    };

    const scrollToEnd = () => {
        const el = scrollableChineseWordsRef.current;
        if (el) {
            el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        }
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
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-gray-600 dark:text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="words-flash-card-deck-container"
            className="m-v-4 flex min-h-dvh w-full flex-col items-center justify-center gap-2 bg-gray-50 p-4 transition-colors dark:bg-gray-900"
            style={{
                minHeight: vvHeight ? `${vvHeight}px` : '100dvh',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* top buttons experiment */}
            <div
                data-testid="top-buttons"
                className="flex flex-wrap items-center justify-around gap-1"
                style={{ display: 'none' }}
            >
                <button
                    data-testid="upload-file-button-4"
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
                        id="upload-file-button-4-hidden-input"
                        data-testid="upload-file-button-4-hidden-input"
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.csv"
                        className="hidden"
                        onChange={handleUploadFile}
                    />
                </button>
                <button
                    data-testid="words-is-theme-dark-button"
                    title="toggle between light and dark mode"
                    onClick={() => {
                        toggleIsThemeDark();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    {isThemeDark ? <MoonIcon /> : <SunIcon />}
                </button>
            </div>

            {/* Card */}
            <div
                data-testid="words-flash-card-container"
                ref={cardRef}
                className="relative w-full touch-pan-y rounded-3xl bg-white p-6 shadow-lg transition-colors dark:bg-gray-800"
            >
                {/* float left edge buttons */}
                <div
                    data-testid="floating-left-edge-buttons"
                    className="left-３ absolute top-1 hidden text-gray-700 dark:text-gray-400"
                    style={{
                        display: 'none',
                    }}
                >
                    <div className="full-width flex flex-col content-around items-stretch gap-2">
                        <button
                            data-testid="upload-file-button-3"
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
                                id="upload-file-button-3-hidden-input"
                                data-testid="upload-file-button-3-hidden-input"
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.csv"
                                className=""
                                style={{
                                    visibility: 'hidden',
                                }}
                                onChange={handleUploadFile}
                            />
                        </button>
                        <button
                            data-testid="words-is-theme-dark-button"
                            title="toggle between light and dark mode"
                            onClick={() => {
                                toggleIsThemeDark();
                                handlePopupKeyboardBlur();
                            }}
                            onMouseDown={preventDefault}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {isThemeDark ? <MoonIcon /> : <SunIcon />}
                        </button>
                        <div
                            data-testid="words-progress-status-label"
                            className="flex self-center py-2 text-center text-sm font-medium text-gray-300 dark:border-gray-700 dark:text-gray-300"
                        >
                            {currentIndex + 1} / {totalCards}
                        </div>
                    </div>
                </div>

                {/* float right edge buttons */}
                <div
                    data-testid="floating-right-edge-buttons"
                    className="absolute top-1 right-2 text-gray-700 dark:text-gray-400"
                    style={{
                        display: 'none',
                    }}
                >
                    <div className="full-width flex flex-col content-around items-stretch gap-2">
                        <button
                            data-testid="upload-file-button-2"
                            title="select chinese word file"
                            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => {
                                handleUploadFileIcon();
                                handlePopupKeyboardBlur();
                            }}
                            style={{
                                visibility: 'hidden', // testing
                            }}
                            onMouseDown={preventDefault}
                        >
                            <DotDotDotIcon />
                            {/* Hidden File Input */}
                            <input
                                id="upload-file-button-2-hidden-input"
                                data-testid="upload-file-button-2-hidden-input"
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.csv"
                                className="hidden"
                                onChange={handleUploadFile}
                            />
                        </button>
                        <div
                            className=""
                            style={{
                                visibility: 'hidden',
                            }}
                        >
                            <button
                                data-testid="reveal-description-button"
                                title="reveal description"
                                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                onClick={() => {
                                    toggleRevealDescription();
                                    handlePopupKeyboardBlur();
                                }}
                                onMouseDown={preventDefault}
                            >
                                {descriptionVisible ? (
                                    <OpenDocumentIcon />
                                ) : (
                                    <ClosedDocumentIcon />
                                )}
                            </button>
                        </div>
                        <div
                            className=""
                            style={{
                                visibility: 'hidden',
                            }}
                        >
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
                        </div>
                    </div>
                </div>

                {/* float bottom middle buttons */}
                <div
                    data-testid="floating-bottom-middle-buttons"
                    className="absolute right-0 bottom-0 left-0 py-0 text-gray-700 dark:text-gray-600"
                >
                    <div
                        data-testid="words-progress-status-label"
                        className="flex justify-center self-center py-1 text-center text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
                    >
                        {currentIndex + 1} / {totalCards}
                    </div>
                </div>

                {/* float bottom left buttons */}
                <div
                    data-testid="floating-bottom-left-buttons"
                    className="absolute bottom-2 left-4 py-0 text-gray-700 dark:text-gray-400"
                    style={{ display: 'none' }}
                >
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
                            accept=".json,.csv"
                            className="hidden"
                            onChange={handleUploadFile}
                        />
                    </button>
                </div>

                {/* float bottom right buttons */}
                <div
                    data-testid="floating-bottom-right-buttons"
                    className="absolute right-4 bottom-2 py-0 text-gray-700 dark:text-gray-400"
                    style={{ display: 'none' }}
                >
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
                </div>

                {/* Chinese characters */}
                <div
                    ref={scrollableChineseWordsRef}
                    data-testid="words-chinese-scrollable-container"
                    className="[&::-webkit-scrollbar] flex flex-row items-center gap-2 overflow-x-auto px-0 py-2 pb-2 whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700"
                    onTouchStart={stopPropagation}
                    onTouchEnd={stopPropagation}
                >
                    <div
                        data-testid="words-chinese-container"
                        className="mx-auto flex flex-col items-center justify-center gap-3"
                    >
                        {/* Traditional */}
                        <div
                            data-testid="words-traditional-label"
                            className="flex flex-col items-center"
                            onClick={() => {
                                speakJyutping();
                                handlePopupKeyboardBlur();
                            }}
                            onMouseDown={preventDefault}
                        >
                            <div className="flex gap-1">
                                {currentCardTrads.map((tradWord, i) => {
                                    const key = i + (revealed ? 1 : 0) * 100; // TBD: react need help to redraw when revealed is changed
                                    return (
                                        <div
                                            key={key}
                                            className="flex flex-col gap-4"
                                        >
                                            <div
                                                data-testid={`words-trad-text-${i}`}
                                                className={`cursor-pointer text-center text-[2.5rem] font-medium text-gray-800 dark:text-gray-200 ${inputMatchedTrads[i] ? 'rounded-md bg-green-600 text-white' : 'text-gray-800'}`}
                                            >
                                                {tradWord}
                                            </div>
                                            <div
                                                data-testid={`words-trad-phonetic-${i}`}
                                                className={`wrap-break-words text-center text-[0.7rem] text-gray-600 transition-opacity dark:text-gray-200 ${inputMatchedJyutpings[i] || revealed ? 'opacity-100' : 'opacity-0'} ${inputMatchedJyutpings[i] ? 'rounded-md bg-green-600 text-white' : 'text-gray-800'}`}
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
                            className="flex flex-col items-center"
                            onClick={() => {
                                speakPinyin();
                                handlePopupKeyboardBlur();
                            }}
                            onMouseDown={preventDefault}
                        >
                            <div className="flex gap-1">
                                {currentCardSimps.map((simplWord, i) => {
                                    const key = i + (revealed ? 1 : 0) * 100; // TBD: react need help to redraw when revealed is changed
                                    return (
                                        <div
                                            key={key}
                                            className="flex flex-col gap-4"
                                        >
                                            <div
                                                data-testid={`words-simp-text-${i}`}
                                                className={`cursor-pointer text-center text-[2.5rem] font-medium text-gray-800 dark:text-gray-200 ${inputMatchedSimpls[i] ? 'rounded-md bg-green-600 text-white' : 'text-gray-800'}`}
                                            >
                                                {simplWord}
                                            </div>
                                            <div
                                                data-testid={`words-simp-phonetic-${i}`}
                                                className={`wrap-break-words text-center text-[0.7rem] text-gray-600 transition-opacity dark:text-gray-200 ${inputMatchedPinyins[i] || revealed ? 'opacity-100' : 'opacity-0'} ${inputMatchedPinyins[i] ? 'rounded-md bg-green-600 text-white' : 'text-gray-800'}`}
                                            >
                                                {currentCardPinyins[i]}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div
                    data-testid="words-description-label"
                    // className={`w-[calc(100% - 2rem)] mx-12 overflow-x-auto text-center whitespace-nowrap text-gray-500 dark:border-gray-700 dark:text-gray-300 ${descriptionVisible ? 'visible' : 'invisible'}`}
                    className={`overflow-x-auto text-center whitespace-nowrap text-gray-500 dark:border-gray-700 dark:text-gray-300 ${descriptionVisible ? 'visible' : 'invisible'}`}
                    onMouseDown={preventDefault}
                    onTouchStart={stopPropagation}
                    onTouchEnd={stopPropagation}
                >
                    {currentCard.en}
                </div>
            </div>

            {/* Input row */}
            <div className="flex w-full flex-wrap items-center justify-center gap-1">
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
                        accept=".json,.csv"
                        className="hidden"
                        onChange={handleUploadFile}
                    />
                </button>
                {/* input box */}
                <div
                    data-testid="words-input-box-container"
                    className="flex flex-1 items-center rounded-full border border-gray-300 bg-gray-100 px-4 transition-colors focus-within:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:focus-within:border-gray-500"
                >
                    <input
                        title="type in jyutping, pinyin, or chinese"
                        id="words-input-box"
                        data-testid="words-input-box"
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            handleInputChange(e);
                        }}
                        onFocus={handlePopupKeyboardPreventScroll}
                        placeholder={`Jyutping / Pinyin`}
                        className="flex w-full flex-1 bg-transparent py-3 text-base text-gray-800 outline-none dark:text-gray-200"
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

            {/* bottom buttons experiment */}
            <div
                data-testid="bottom-buttons"
                className="flex flex-wrap items-center justify-around gap-1"
                style={{ display: 'none' }}
            >
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
                <button
                    data-testid="upload-file-button-1"
                    title="select a chinese word file"
                    className="h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    style={{
                        display: 'none',
                    }}
                    onClick={() => {
                        handleUploadFileIcon();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                >
                    <UploadFileIcon />
                    {/* Hidden File Input */}
                    <input
                        id="upload-file-button-1-hidden-input"
                        data-testid="upload-file-button-1-hidden-input"
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.csv"
                        className=""
                        style={{
                            visibility: 'hidden',
                        }}
                        onChange={handleUploadFile}
                    />
                </button>
                <button
                    data-testid="words-is-theme-dark-button"
                    title="toggle between light and dark theme"
                    onClick={() => {
                        toggleIsThemeDark();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    style={{ display: 'none' }}
                >
                    {isThemeDark ? <MoonIcon /> : <SunIcon />}
                </button>

                <button
                    data-testid="reveal-description-button"
                    title="reveal description"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                        toggleRevealDescription();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                >
                    {descriptionVisible ? (
                        <OpenDocumentIcon />
                    ) : (
                        <ClosedDocumentIcon />
                    )}
                </button>
                <div
                    data-testid="words-progress-status-label"
                    className="self-center py-2 text-center text-sm font-medium text-gray-300 dark:border-gray-700 dark:text-gray-300"
                >
                    {currentIndex + 1} / {totalCards}
                </div>

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

            {/* scroll experiment */}
            <div className="mb-4 flex gap-2" style={{ display: 'none' }}>
                <button
                    onClick={scroll}
                    className="rounded bg-gray-200 px-3 py-1"
                >
                    scroll
                </button>
                <button
                    onClick={scrollToStart}
                    className="rounded bg-gray-200 px-3 py-1"
                >
                    Beginning
                </button>
                <button
                    onClick={scrollToMiddle}
                    className="rounded bg-gray-200 px-3 py-1"
                >
                    Middle
                </button>
                <button
                    onClick={scrollToEnd}
                    className="rounded bg-gray-200 px-3 py-1"
                >
                    End
                </button>
            </div>
        </div>
    );
}

export default FlashCardCN;
