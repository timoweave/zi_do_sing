import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect,
} from 'react';
import {
    BookSearchIcon,
    CheckMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClosedEyeIcon,
    DeepSeekIcon,
    FlaskIcon,
    GearIcon,
    OpenEyeIcon,
    ShuffleIcon,
    TextIcon,
    UploadFileIcon,
    type TestIdProps,
} from './Icons';
import * as OpenCC from 'opencc-js';
import ZhCnFlagIcon from '../assets/cn_flag.png';
import ZhHkFlagIcon from '../assets/hk_flag.png';
import EnUsFlagIcon from '../assets/uk_flag.png';
import defaultWords from '../words/sentences_002.json';
import charListJson from '../canto_dicts/canto_charlist.json';
import wordsListJson from '../canto_dicts/canto_wordslist.json';
import { pinyin as toPinyin } from 'pinyin-pro';
// @ts-expect-error: hanzi types don't include definitionLookup
import hanzi from 'hanzi';
import createEphone from 'ephone';

hanzi.start();
const ephone = await createEphone();

const LINGUALS = ['zh-HK', 'zh-CN', 'en-US'] as const;
type Lingual = (typeof LINGUALS)[number];

function isOnlyChineseWithPunctuation(str: string): boolean {
    return /^[\p{Script=Han}\p{Punctuation}\s]+$/u.test(str);
}

export interface WordSoundLingual {
    words: string;
    sounds: string;
    lingual: Lingual;
}

export type EquivalentWordSoundLingual = WordSoundLingual[];

export interface CardItem {
    trad: string;
    simp: string;
    jyutping: string;
    pinyin: string;
    en: string;
    zh: string;
}

export const convertCardItemtoEquivalentWordSoundLingual = (
    card: CardItem
): EquivalentWordSoundLingual => [
    {
        words: card.trad ?? '',
        sounds: card.jyutping ?? '',
        lingual: 'zh-HK',
    } as WordSoundLingual,
    {
        words: card.simp ?? '',
        sounds: card.pinyin ?? '',
        lingual: 'zh-CN',
    } as WordSoundLingual,
    {
        words: card.en ?? '',
        sounds: ephone.textToIpa(card.en ?? '') ?? '',
        lingual: 'en-US',
    } as WordSoundLingual,
];

const findLingual = (
    card: EquivalentWordSoundLingual | null,
    lingual: Lingual
): WordSoundLingual | undefined =>
    card?.find((entry) => entry.lingual === lingual);

export const shuffleItems = <T,>(words: T[]): T[] => {
    let list: T[] = [];
    while (list.length < words.length) {
        for (let w of words) {
            if (list.length >= words.length) break;
            list.push(structuredClone(w));
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

export const getSimplified = OpenCC.Converter({ from: 'hk', to: 'cn' });

export interface WordAndSound {
    word: string; // single word
    sound: string; // written sound in jyutping, pinyin, ipa, ...
    lang: string; // speech lang, like zh-HK, zh-CN, en-US
}

export interface WordAndSoundAux {
    ith: number; // ith word in a sentence
    isAllMatched: boolean;
    isWordMatched: boolean;
    isSoundMatched: boolean;
    isAllSoundRevealed: boolean;
    isSmall: boolean;
}

function WordAndSound({
    wordAndSound,
    wordAndSoundAux,
}: {
    wordAndSound: WordAndSound;
    wordAndSoundAux: WordAndSoundAux;
}) {
    const { word, sound, lang } = wordAndSound;
    const {
        ith,
        isAllSoundRevealed,
        isAllMatched, // either all text or all sound
        isSoundMatched,
        isWordMatched,
        isSmall = false,
    } = wordAndSoundAux;
    const clickTimeoutRef = useRef<number | null>(null);
    const clickCountRef = useRef(0);

    const speakWord = () => {
        clickCountRef.current += 1;

        if (clickCountRef.current === 1) {
            clickTimeoutRef.current = setTimeout(() => {
                if (clickCountRef.current === 1) {
                    speak({ text: word, lang });
                }

                clickCountRef.current = 0;
                clickTimeoutRef.current = null;
            }, 250);
        } else if (clickCountRef.current === 2) {
            if (clickTimeoutRef.current != null) {
                clearTimeout(clickTimeoutRef.current);
            }

            clickCountRef.current = 0;
            clickTimeoutRef.current = null;
        }
    };

    return (
        <div
            data-testid={`traditional-jyuting-${ith}`}
            className={`flex flex-col pt-1 ${(isSoundMatched || isWordMatched) && !isAllMatched ? 'rounded-md bg-gray-600' : 'text-gray-800'}`}
            onClick={speakWord}
        >
            {/* word */}
            <div
                data-testid={`words-trad-text-${ith}`}
                className={`cursor-pointer pt-1 text-center ${isSmall ? 'text-[1.5rem]' : 'text-[2.5rem]'} leading-none font-medium text-gray-800 dark:text-gray-200`}
            >
                {word}
            </div>
            {/* sound */}
            <div
                data-testid={`words-trad-phonetic-${ith}`}
                className={`wrap-break-words text-center text-[1rem] text-gray-600 transition-opacity dark:text-gray-400 ${isSoundMatched || isAllSoundRevealed ? 'opacity-100' : 'opacity-0'} `}
            >
                {sound}
            </div>
        </div>
    );
}

interface WordsAndSounds {
    words: string[];
    sounds: string[];
    lang: string;
}

interface WordsAndSoundsAux {
    isWordsMatched: boolean[];
    isSoundMatched: boolean[];
}

function ShowSoundButton({
    isSoundShown,
    onClick,
    onMouseDown,
}: {
    isSoundShown: boolean;
} & Pick<React.ComponentPropsWithoutRef<'button'>, 'onClick' | 'onMouseDown'>) {
    return (
        <button
            data-testid="reveal-phonetic-button"
            title="reveal phonetic"
            onClick={onClick}
            onMouseDown={onMouseDown}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Toggle pronunciation"
        >
            {isSoundShown ? <OpenEyeIcon /> : <ClosedEyeIcon />}
        </button>
    );
}

function MoveForwardButton({
    onClick,
    onMouseDown,
}: {} & Pick<
    React.ComponentPropsWithoutRef<'button'>,
    'onClick' | 'onMouseDown'
>) {
    return (
        <button
            data-testid="next-words-card-button"
            title="go to next card"
            onClick={onClick}
            onMouseDown={onMouseDown}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Next"
        >
            <ChevronRightIcon />
        </button>
    );
}

function MoveBackwardButton({
    onClick,
    onMouseDown,
}: {} & Pick<
    React.ComponentPropsWithoutRef<'button'>,
    'onClick' | 'onMouseDown'
>) {
    return (
        <button
            data-testid="previous-words-card-button"
            title="go to previous card"
            onClick={onClick}
            onMouseDown={onMouseDown}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Previous"
        >
            <ChevronLeftIcon />
        </button>
    );
}

function FlippingButton({
    isFlipped,
    onClick,
    onMouseDown,
}: {
    isFlipped: boolean;
} & Pick<React.ComponentPropsWithoutRef<'button'>, 'onClick' | 'onMouseDown'>) {
    return (
        <button
            data-testid="flipping-button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Flip card"
            onClick={onClick}
            onMouseDown={onMouseDown}
        >
            {isFlipped ? <FlaskIcon /> : <GearIcon />}
        </button>
    );
}

function LingualButton({
    'data-testid': dataTestid,
    isOn,
    onClick,
    src,
    alt = 'icon',
}: { isOn: boolean } & Pick<
    React.ComponentPropsWithoutRef<'button'>,
    'onClick'
> &
    Pick<React.ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> &
    TestIdProps) {
    return (
        <button
            data-testid={dataTestid}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()}
        >
            <img
                src={src}
                alt={alt}
                className={`h-6 w-6 object-contain ${isOn ? 'brightness-100' : 'brightness-50'}`}
            />
        </button>
    );
}

function DeepSeekButton({
    onClick,
    'data-testid': dataTestid = 'deepseek-button',
    title = 'use deepseek to get chinese words',
}: {} & TestIdProps &
    Pick<React.ComponentPropsWithoutRef<'button'>, 'onClick' | 'title'>) {
    return (
        <button
            data-testid={dataTestid}
            title={title}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()}
        >
            <DeepSeekIcon />
        </button>
    );
}

function DictionaryButton({
    onClick,
    icon,
    title,
}: { icon: React.ReactNode } & Pick<
    React.ComponentPropsWithoutRef<'button'>,
    'onClick' | 'title'
>) {
    return (
        <button
            data-testid="dictionary-button"
            title={title}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()}
        >
            {icon}
        </button>
    );
}

function UploadFileButton({
    handleUploadFile,
    handlePopupKeyboardBlur,
}: {
    handlePopupKeyboardBlur: () => void;
    handleUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <button
            data-testid="upload-file-button-5"
            title="select chinese word file"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => {
                fileInputRef.current?.click();
                handlePopupKeyboardBlur();
            }}
            onMouseDown={(e) => e.preventDefault()}
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
    );
}

function InputWithCheckMark({
    inputValue,
    inputRef,
    inputMatched,
    handlePopupKeyboardBlur,
    onBlur,
    onChange,
    onFocus,
    currentIndex,
    totalCards,
}: {
    inputRef: React.ForwardedRef<HTMLInputElement>;
    inputValue: string;
    inputMatched: boolean;
    handlePopupKeyboardBlur: () => void;
    setIsInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
    currentIndex: number;
    totalCards: number;
} & Pick<
    React.ComponentPropsWithoutRef<'input'>,
    'onChange' | 'onFocus' | 'onBlur'
>) {
    return (
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
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={`${currentIndex + 1}/${totalCards} 粵拼／拼音`}
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
    );
}

function SentenceAndSounds({
    wordsAndSounds,
    wordsAndSoundsAux,
    onMouseDown,
    inputMatched,
    isSoundShown,
    showLangs,
}: {
    showLangs: readonly Lingual[];
    wordsAndSounds: WordsAndSounds[];
    wordsAndSoundsAux: WordsAndSoundsAux[];
    inputMatched: boolean;
    isSoundShown: boolean;
} & Pick<React.ComponentPropsWithoutRef<'div'>, 'onMouseDown'>) {
    return (
        <div
            data-testid="words-chinese-container"
            className="mx-auto flex flex-col items-center justify-center gap-2"
        >
            {wordsAndSounds
                .flatMap((wordAndSound, index) =>
                    showLangs.includes(wordAndSound.lang as Lingual)
                        ? [{ wordAndSound, aux: wordsAndSoundsAux[index] }]
                        : []
                )
                .map(({ wordAndSound, aux }, row) => (
                    <div
                        key={row}
                        data-testid={`words-traditional-label-${row}`}
                        className="flex flex-col items-center gap-1"
                        onDoubleClick={(e) => {
                            speak({
                                text: wordAndSound.words.join(''),
                                lang: wordAndSound.lang,
                            });
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onMouseDown={onMouseDown}
                    >
                        {/* Chinese characters row i-th */}
                        <div
                            className={`${inputMatched && aux.isSoundMatched.every((a) => a == true) ? 'rounded-md bg-gray-600' : ''} flex gap-1`}
                        >
                            {wordAndSound.words.map((word, i) => {
                                const key =
                                    /* TBD: react need help to redraw when revealed is changed */
                                    100 * Number(isSoundShown) + 10 * row + i;
                                const sound = wordAndSound.sounds[i];
                                const isCharMatched = aux.isWordsMatched[i];
                                const isSoundMatched = aux.isSoundMatched[i];

                                return (
                                    <WordAndSound
                                        key={key}
                                        wordAndSound={{
                                            word,
                                            sound,
                                            lang: wordAndSound.lang,
                                        }}
                                        wordAndSoundAux={{
                                            ith: i,
                                            isAllMatched: inputMatched,
                                            isWordMatched: isCharMatched,
                                            isSoundMatched,
                                            isAllSoundRevealed: isSoundShown,
                                            isSmall:
                                                wordAndSound.lang === 'en-US',
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
        </div>
    );
}

function FlashCardCN() {
    const [equivalentWordSoundLinguals, setEquivalentWordSoundLinguals] =
        useState<EquivalentWordSoundLingual[]>([]);
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
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [showLangs, setShowLangs] = useState<readonly Lingual[]>(LINGUALS);
    const inputRowRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef(null);
    const scrollableChineseWordsRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const [isThemeDark, _setIsThemeDark] = useState(true);
    const [_vvWidth, vvHeight] = useVisualViewport();
    const [scrollThumb, setScrollThumb] = useState<{
        widthPct: number;
        leftPct: number;
    } | null>(null);
    const scrollTrackRef = useRef<HTMLDivElement>(null);
    const scrollDragRef = useRef<{
        startX: number;
        startScrollLeft: number;
    } | null>(null);

    const currentCard = equivalentWordSoundLinguals[currentIndex] || null;
    const totalCards = equivalentWordSoundLinguals.length;
    const currentZhHk = findLingual(currentCard, 'zh-HK');
    const currentZhCn = findLingual(currentCard, 'zh-CN');
    const currentEnUs = findLingual(currentCard, 'en-US');
    const currentTrad = currentZhHk?.words ?? '';
    const currentJyutping = currentZhHk?.sounds ?? '';
    const currentSimp = currentZhCn?.words ?? '';
    const currentPinyin = currentZhCn?.sounds ?? '';
    const currentCardTrads = currentTrad.split('');
    const currentCardJyutpings = currentJyutping.split(/ +/);
    const currentCardSimps = currentSimp.split('');
    const currentCardPinyins = currentPinyin.split(/ +/);

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

    const toggleFlipCard = useCallback(() => {
        setIsFlipped((prev) => !prev);
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
            const inputList = input.toLowerCase().match(/[a-zA-Z,.]+\d*/g);
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
                    expectedPhonetic: currentJyutping,
                    setMatchedPhonetic: setInputMatchedJyutpings,
                },
                {
                    expectedPhonetic: currentPinyin,
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
            currentJyutping,
            currentPinyin,
            // inputMatched,
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
                speak({ text: currentTrad, lang: 'zh-HK' });
                return;
            }
            if (e.key === 'ArrowDown' && e.shiftKey && !isInputFocused) {
                e.preventDefault();
                speak({ text: currentSimp, lang: 'zh-CN' });
                return;
            }
            if (e.key === '/') {
                e.preventDefault();
                toggleRevealPhonetic();
                return;
            }
            if (e.key === ',') {
                e.preventDefault();
                scrollToStart();
                return;
            }
            if (e.key === '<') {
                e.preventDefault();
                scrollByWidth(-1);
                return;
            }
            if (e.key === "'") {
                e.preventDefault();
                scrollToMiddle('smooth');
                return;
            }
            if (e.key === '>') {
                e.preventDefault();
                scrollByWidth(1);
                return;
            }
            if (e.key === '.') {
                e.preventDefault();
                scrollToEnd();
                return;
            }
            if (e.key === '?') {
                e.preventDefault();
                speak({ text: currentTrad, lang: 'zh-HK' });
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
            currentTrad,
            currentSimp,
            currentIndex,
            speak,
            toggleRevealPhonetic,
            goToPrevCard,
            goToNextCard,
            inputMatched,
            inputMatchedJyutpings,
            inputMatchedPinyins,
            inputValue,
            isInputFocused,
        ]
    );

    const handleUploadFile = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const equivalentWordSoundLinguals = (
                        JSON.parse(content) as CardItem[]
                    ).map(convertCardItemtoEquivalentWordSoundLingual);

                    if (
                        Array.isArray(equivalentWordSoundLinguals) &&
                        equivalentWordSoundLinguals.length > 0
                    ) {
                        setEquivalentWordSoundLinguals(
                            equivalentWordSoundLinguals
                        );
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

    const hasShowLang = useCallback(
        (lang: Lingual): boolean => showLangs.includes(lang),
        [showLangs]
    );

    const toggleShowLang = useCallback((lang: Lingual): void => {
        setShowLangs((prevLangs) =>
            prevLangs.includes(lang)
                ? prevLangs.filter((prevLang) => prevLang !== lang)
                : prevLangs.concat(lang)
        );
    }, []);

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
        if (scrollableChineseWordsRef.current == null || currentZhHk == null) {
            return;
        }

        const el = scrollableChineseWordsRef.current;
        const tradLength = currentTrad.trim().split('').length;
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

    const scrollByWidth = (direction: 1 | -1 | null = 1) => {
        if (scrollableChineseWordsRef.current == null || currentZhHk == null) {
            return;
        }

        const el = scrollableChineseWordsRef.current;
        const movePosition =
            direction == null
                ? (el.scrollWidth - el.clientWidth) / 2
                : el.scrollLeft + (direction * el.clientWidth) / 2;

        el.scrollTo({ left: movePosition, behavior: 'smooth' });
    };

    const scrollToMiddle = (behavior: ScrollBehavior = 'auto') => {
        if (scrollableChineseWordsRef.current == null || currentZhHk == null) {
            return;
        }

        const el = scrollableChineseWordsRef.current;
        const movePosition = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);

        el.scrollTo({ left: movePosition, behavior });
    };

    const scrollToStart = () => {
        scrollableChineseWordsRef.current?.scrollTo({
            left: 0,
            behavior: 'smooth',
        });
    };

    const scrollToEnd = () => {
        if (scrollableChineseWordsRef.current == null || currentZhHk == null) {
            return;
        }

        const el = scrollableChineseWordsRef.current;
        const movePosition = el.scrollWidth - el.clientWidth;

        scrollableChineseWordsRef.current?.scrollTo({
            left: movePosition,
            behavior: 'smooth',
        });
    };

    const shuffleCards = useCallback((words: EquivalentWordSoundLingual[]) => {
        const initialCards = shuffleItems(words);
        const randomIndex = Math.floor(Math.random() * initialCards.length);

        setEquivalentWordSoundLinguals(initialCards);
        setCurrentIndex(randomIndex);
    }, []);

    // Initialize cards
    useEffect(() => {
        shuffleCards(defaultWords as EquivalentWordSoundLingual[]);
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

    useLayoutEffect(() => {
        const el = scrollableChineseWordsRef.current;
        if (el == null) {
            return;
        }

        scrollToMiddle('instant');
        // iOS may swap in the web font after the first layout, changing scrollWidth
        let isCancelled = false;
        document.fonts.ready.then(() => {
            if (isCancelled) {
                return;
            }
            scrollToMiddle('instant');
        });

        return () => {
            isCancelled = true;
        };
    }, [currentTrad]);

    useEffect(() => {
        setTradIndex(
            (inputRef.current?.value.trim().split(/ +/).length ?? 1) - 1
        );
    }, [inputRef.current?.value]);

    const updateScrollThumb = useCallback(() => {
        const el = scrollableChineseWordsRef.current;
        if (!el || el.scrollWidth <= el.clientWidth + 1) {
            setScrollThumb(null);
            return;
        }
        setScrollThumb({
            widthPct: (el.clientWidth / el.scrollWidth) * 100,
            leftPct: (el.scrollLeft / el.scrollWidth) * 100,
        });
    }, []);

    useEffect(() => {
        const el = scrollableChineseWordsRef.current;
        if (!el) return;
        updateScrollThumb();
        el.addEventListener('scroll', updateScrollThumb, {
            passive: true,
        });
        const observer = new ResizeObserver(updateScrollThumb);
        observer.observe(el);
        if (el.firstElementChild) observer.observe(el.firstElementChild);
        return () => {
            el.removeEventListener('scroll', updateScrollThumb);
            observer.disconnect();
        };
    }, [updateScrollThumb, currentTrad]);

    const handleScrollTrackPointerDown = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        const el = scrollableChineseWordsRef.current;
        const track = scrollTrackRef.current;
        if (!el || !track) return;
        e.preventDefault();

        const rect = track.getBoundingClientRect();
        const thumbWidth = (el.clientWidth / el.scrollWidth) * rect.width;
        const thumbLeft =
            rect.left + (el.scrollLeft / el.scrollWidth) * rect.width;
        const isOnThumb =
            e.clientX >= thumbLeft && e.clientX <= thumbLeft + thumbWidth;

        // Pressed on the empty track: jump so the thumb centers on the pointer
        if (!isOnThumb) {
            const fraction =
                (e.clientX - rect.left - thumbWidth / 2) / rect.width;
            el.scrollLeft = fraction * el.scrollWidth;
        }

        scrollDragRef.current = {
            startX: e.clientX,
            startScrollLeft: el.scrollLeft,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleScrollTrackPointerMove = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        const drag = scrollDragRef.current;
        const el = scrollableChineseWordsRef.current;
        const track = scrollTrackRef.current;
        if (!drag || !el || !track) return;

        // Thumb moves dx px along the track => content moves dx * (scrollWidth / trackWidth)
        const dx = e.clientX - drag.startX;
        el.scrollLeft =
            drag.startScrollLeft +
            dx * (el.scrollWidth / track.getBoundingClientRect().width);
    };

    const handleScrollTrackPointerUp = (
        e: React.PointerEvent<HTMLDivElement>
    ) => {
        scrollDragRef.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

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
            <div className="flex min-h-dvh items-center justify-center bg-gray-50 dark:bg-gray-900">
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
            lang: 'zh-HK',
        },
        {
            words: currentCardSimps,
            sounds: currentCardPinyins,
            lang: 'zh-CN',
        },
        {
            words: currentEnUs?.words?.split(/[ ]/) ?? [],
            sounds: currentEnUs?.sounds?.split(/[ ]/) ?? [],
            lang: 'en-US',
        },
    ];

    const wordsAndSoundsAux: WordsAndSoundsAux[] = [
        {
            isWordsMatched: inputMatchedTrads,
            isSoundMatched: inputMatchedJyutpings,
        },
        {
            isWordsMatched: inputMatchedSimpls,
            isSoundMatched: inputMatchedPinyins,
        },
        {
            isWordsMatched: [false],
            isSoundMatched: [false],
        },
    ];

    return (
        /* Card Deck */
        <div
            id="words-flash-card-deck-container"
            data-testid="words-flash-card-deck-container"
            className="font-m-plus m-v-4 flex min-h-dvh w-full flex-col items-center justify-center gap-2 bg-gray-50 p-4 transition-colors dark:bg-gray-900"
            style={{
                minHeight: vvHeight ? `${vvHeight}px` : '100dvh',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Card front & back side Container */}
            <div
                data-testid="words-flash-card-front-and-back-container"
                className="relative w-full max-w-120 perspective-[1000px]"
            >
                {/* Card front side Container */}
                <div
                    id="words-flash-card-container"
                    data-testid="words-flash-card-container"
                    ref={cardRef}
                    className={`relative flex w-full max-w-120 touch-pan-y flex-col place-content-around rounded-3xl bg-white p-6 pb-0 shadow-lg transition-transform duration-500 backface-hidden dark:bg-gray-800 ${
                        isFlipped
                            ? 'transform-[rotateY(180deg)]'
                            : 'transform-[rotateY(0deg)]'
                    }`}
                >
                    {/* Chinese characters rows container */}
                    <div
                        ref={scrollableChineseWordsRef}
                        data-testid="words-chinese-scrollable-container"
                        className="flex scrollbar-none flex-row items-center gap-2 overflow-x-auto px-0 py-2 pb-2 whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
                        onTouchStart={stopPropagation}
                        onTouchEnd={stopPropagation}
                    >
                        <SentenceAndSounds
                            showLangs={showLangs}
                            wordsAndSounds={wordsAndSounds}
                            wordsAndSoundsAux={wordsAndSoundsAux}
                            onMouseDown={preventDefault}
                            inputMatched={inputMatched}
                            isSoundShown={revealed}
                        />
                    </div>
                    {/* Custom scroll indicator (iOS hides native scrollbars) */}
                    <div
                        aria-hidden="true"
                        data-testid="words-chinese-scroll-track"
                        className={`-mt-3 cursor-pointer touch-none py-1 select-none ${scrollThumb ? '' : 'invisible'}`}
                        onPointerDown={handleScrollTrackPointerDown}
                        onPointerMove={handleScrollTrackPointerMove}
                        onPointerUp={handleScrollTrackPointerUp}
                        onPointerCancel={handleScrollTrackPointerUp}
                        onTouchStart={stopPropagation}
                        onTouchEnd={stopPropagation}
                    >
                        <div
                            ref={scrollTrackRef}
                            className="relative h-4 rounded-full bg-slate-200 dark:bg-slate-700"
                        >
                            {scrollThumb && (
                                <div
                                    className="absolute inset-y-0 rounded-full bg-slate-400 dark:bg-slate-500"
                                    style={{
                                        width: `${scrollThumb.widthPct}%`,
                                        left: `${scrollThumb.leftPct}%`,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Card Back Side Container */}
                <div
                    data-testid="words-flash-card-back-side-container"
                    className={`absolute inset-0 flex w-full max-w-120 touch-pan-y flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-lg transition-transform duration-500 backface-hidden dark:bg-gray-800 ${
                        isFlipped
                            ? 'transform-[rotateY(0deg)]'
                            : 'transform-[rotateY(-180deg)]'
                    }`}
                >
                    <div className="flex flex-wrap gap-2 py-4 text-center text-xl font-medium text-gray-800 dark:text-gray-200">
                        <UploadFileButton
                            handleUploadFile={handleUploadFile}
                            handlePopupKeyboardBlur={handlePopupKeyboardBlur}
                        />
                        <DictionaryButton
                            title="shuffle dictionary"
                            data-testid="en-us-button"
                            icon={<ShuffleIcon />}
                            onClick={() => {
                                shuffleCards(equivalentWordSoundLinguals);
                            }}
                        />
                        <DeepSeekButton onClick={() => {}} />
                        <DictionaryButton
                            title="use char list chinese dictionary"
                            icon={<BookSearchIcon />}
                            onClick={() => {
                                const items: EquivalentWordSoundLingual[] =
                                    Object.entries(charListJson)
                                        .filter(([trad]) => {
                                            return isOnlyChineseWithPunctuation(
                                                trad
                                            );
                                        })
                                        .map(([trad, sounds]) => {
                                            const simp = getSimplified(trad);
                                            const pinyin = toPinyin(simp, {
                                                toneType: 'num',
                                                pattern: 'pinyin',
                                                v: true,
                                            });
                                            let en = '❔';
                                            let ipa = '';
                                            try {
                                                const lookup =
                                                    hanzi.definitionLookup(
                                                        trad
                                                    );
                                                en = (lookup?.[0]?.definition ??
                                                    '❔') as string;
                                                ipa =
                                                    ephone.textToIpa(
                                                        en ?? ''
                                                    ) ?? '';
                                            } catch {
                                                en = '❔';
                                                ipa = '';
                                            }

                                            const jyutping =
                                                Object.keys(sounds).at(0);

                                            return [
                                                {
                                                    words: trad,
                                                    sounds: jyutping,
                                                    lingual: 'zh-HK',
                                                } as WordSoundLingual,
                                                {
                                                    words: simp,
                                                    sounds: pinyin,
                                                    lingual: 'zh-CN',
                                                } as WordSoundLingual,
                                                {
                                                    words: en,
                                                    sounds: ipa,
                                                    lingual: 'en-US',
                                                } as WordSoundLingual,
                                            ];
                                        });

                                setEquivalentWordSoundLinguals(items);
                            }}
                        />
                        <DictionaryButton
                            title="use words list chinese dictionary"
                            icon={<TextIcon />}
                            onClick={() => {
                                const items = Object.entries(wordsListJson)
                                    .filter(([trad]) => {
                                        return isOnlyChineseWithPunctuation(
                                            trad
                                        );
                                    })
                                    .map(([trad, sounds]) => {
                                        const jyutping = sounds.at(0) ?? '';
                                        const simp = getSimplified(trad);
                                        const pinyin = toPinyin(simp, {
                                            toneType: 'num',
                                            pattern: 'pinyin',
                                            v: true,
                                        });
                                        let en = '❔';
                                        let ipa = '';
                                        try {
                                            const lookup =
                                                hanzi.definitionLookup(trad);
                                            en = (lookup?.[0]?.definition ??
                                                '❔') as string;
                                            ipa =
                                                ephone.textToIpa(en ?? '') ??
                                                '';
                                        } catch {
                                            en = '❔';
                                            ipa = '';
                                        }
                                        return [
                                            {
                                                words: trad,
                                                sounds: jyutping,
                                                lingual: 'zh-HK',
                                            } as WordSoundLingual,
                                            {
                                                words: simp,
                                                sounds: pinyin,
                                                lingual: 'zh-CN',
                                            } as WordSoundLingual,
                                            {
                                                words: en,
                                                sounds: ipa,
                                                lingual: 'en-US',
                                            } as WordSoundLingual,
                                        ];
                                    });

                                setEquivalentWordSoundLinguals(items);
                            }}
                        />
                        <LingualButton
                            data-testid="zh-hk-button"
                            src={ZhHkFlagIcon}
                            isOn={hasShowLang('zh-HK')}
                            onClick={() => toggleShowLang('zh-HK')}
                        />
                        <LingualButton
                            data-testid="zh-cn-button"
                            src={ZhCnFlagIcon}
                            isOn={hasShowLang('zh-CN')}
                            onClick={() => toggleShowLang('zh-CN')}
                        />
                        <LingualButton
                            data-testid="en-us-button"
                            src={EnUsFlagIcon}
                            isOn={hasShowLang('en-US')}
                            onClick={() => toggleShowLang('en-US')}
                        />
                    </div>
                </div>
            </div>

            {/* Input row */}
            <div
                ref={inputRowRef}
                data-testid="words-input-row"
                className="flex w-full max-w-120 flex-wrap items-center justify-center gap-1 pt-3"
            >
                <MoveBackwardButton
                    onClick={() => {
                        goToPrevCard();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                />

                <FlippingButton
                    isFlipped={isFlipped}
                    onClick={() => {
                        toggleFlipCard();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                />
                <InputWithCheckMark
                    inputRef={inputRef}
                    currentIndex={currentIndex}
                    totalCards={totalCards}
                    inputValue={inputValue}
                    inputMatched={inputMatched}
                    setIsInputFocused={setIsInputFocused}
                    handlePopupKeyboardBlur={handlePopupKeyboardBlur}
                    onChange={(e) => {
                        handleInputChange(e);
                        if (e.target.value.at(-1) == ' ') {
                            scroll();
                        }
                    }}
                    onFocus={(e) => {
                        handlePopupKeyboardPreventScroll(e);
                        setIsInputFocused(true);
                        if (inputRowRef.current && isInputFocused) {
                            inputRowRef.current.style.opacity = '0%';
                        }
                    }}
                    onBlur={() => {
                        setIsInputFocused(false);
                        if (inputRowRef.current && isInputFocused) {
                            inputRowRef.current.style.opacity = '100%';
                        }
                    }}
                />
                <ShowSoundButton
                    isSoundShown={revealed}
                    onClick={() => {
                        toggleRevealPhonetic();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={preventDefault}
                />
                <MoveForwardButton
                    onClick={() => {
                        goToNextCard();
                        handlePopupKeyboardBlur();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                />
            </div>
        </div>
    );
}

export default FlashCardCN;
