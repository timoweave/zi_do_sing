export interface TestIdProps {
    'data-testid'?: string;
}

// Icons as inline SVGs
export const SunIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
    >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

export const MoonIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
    >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export const OpenEyeIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        className="stroke-linecap-round stroke-linejoin-round h-7 w-7 fill-none stroke-current stroke-[1.5]"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const ClosedEyeIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        className="stroke-linecap-round stroke-linejoin-round h-7 w-7 fill-none stroke-current stroke-[1.5]"
    >
        <path d="M2 10s3 5 10 5 10-5 10-5" />
        <path d="M4 11.5l-1.5 2.5" />
        <path d="M8 14.5l-1 3" />
        <path d="M12 15v3" />
        <path d="M16 14.5l1 3" />
        <path d="M20 11.5l1.5 2.5" />
    </svg>
);

export const ChevronLeftIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        className="stroke-linecap-round stroke-linejoin-round h-7 w-7 fill-none stroke-current stroke-[1.5]"
    >
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

export const ChevronRightIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        className="stroke-linecap-round stroke-linejoin-round h-7 w-7 fill-none stroke-current stroke-[1.5]"
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

export const BookSearchIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="Book search"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Book cover */}
        <rect x="4.05" y="1.9" width="15.9" height="20.2" rx="2" />

        {/* Bottom pages */}
        <rect x="4.05" y="18.9" width="15.9" height="3.2" rx="1.6" />

        {/* Magnifier lens */}
        <circle cx="10.4" cy="8.75" r="2.65" />

        {/* Magnifier handle */}
        <line x1="12.3" y1="10.65" x2="16.4" y2="14.65" />
    </svg>
);

export const DeepSeekIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="DeepSeek"
    >
        {/* Whale body and tail, with the eye cut out */}
        <path
            transform="translate(0.15 1.7) scale(0.7)"
            d="M33.7472 4.32057C33.3878 4.14492 33.2334 4.48011 33.0234 4.64989C32.9516 4.70478 32.8909 4.7765 32.8302 4.84237C32.3054 5.40296 31.6921 5.77107 30.8915 5.72716C29.7206 5.6613 28.7209 6.02941 27.8368 6.92518C27.6487 5.82084 27.0245 5.16145 26.0745 4.73845C25.5776 4.51889 25.0748 4.29861 24.7265 3.82072C24.4835 3.48041 24.4169 3.10132 24.2954 2.72735C24.2179 2.50194 24.141 2.27141 23.8812 2.23263C23.5995 2.18872 23.489 2.4251 23.3784 2.6227C22.9364 3.43065 22.7652 4.32057 22.782 5.22219C22.8208 7.25012 23.677 8.86529 25.3786 10.0143C25.5718 10.146 25.6215 10.2777 25.5608 10.4702C25.4444 10.8661 25.3068 11.2504 25.1854 11.6463C25.1078 11.8988 24.9921 11.9544 24.7214 11.8439C23.7875 11.4538 22.9811 10.8764 22.2682 10.1789C21.0585 9.00873 19.9644 7.71704 18.6003 6.70563C18.2797 6.46925 17.9592 6.2497 17.6276 6.04039C16.2357 4.68868 17.8099 3.57848 18.1743 3.44675C18.5556 3.30916 18.3068 2.83639 17.0751 2.84225C15.8434 2.84737 14.7164 3.26013 13.2798 3.80974C13.0697 3.89244 12.8487 3.95245 12.6226 4.00222C11.3192 3.75485 9.96528 3.69997 8.55136 3.85951C5.88893 4.1559 3.7622 5.41467 2.19899 7.56335C0.321085 10.146 -0.120946 13.0807 0.419884 16.1412C0.988524 19.3672 2.63516 22.0377 5.16514 24.1256C7.78878 26.2904 10.8106 27.3516 14.2582 27.1481C16.352 27.0274 18.683 26.7471 21.3125 24.5215C21.9755 24.8516 22.6715 24.9833 23.8256 25.0821C24.7148 25.1648 25.571 25.0382 26.2341 24.9006C27.2726 24.6811 27.2008 23.7195 26.8254 23.5431C23.7817 22.1255 24.4499 22.7022 23.8424 22.2353C25.3888 20.4057 27.7512 17.1534 28.4801 12.725C28.5518 12.2361 28.6433 11.5475 28.6323 11.1516C28.6265 10.9101 28.6821 10.8164 28.958 10.7886C29.7206 10.7007 30.4605 10.4922 31.1403 10.1182C33.1126 9.04094 33.9082 7.27135 34.0955 5.15047C34.1233 4.82627 34.0897 4.49109 33.7472 4.32057ZM16.5613 23.4113C13.6113 21.0921 12.1806 20.3288 11.59 20.3618C11.0374 20.3947 11.137 21.027 11.2584 21.439C11.3858 21.8459 11.5512 22.1262 11.7832 22.4834C11.9434 22.7198 12.0539 23.071 11.6229 23.3352C10.673 23.9229 9.0212 23.1376 8.94363 23.0989C7.02108 21.9667 5.41396 20.4723 4.28107 18.4282C3.18697 16.4611 2.55173 14.3504 2.44708 12.0978C2.41927 11.5541 2.57954 11.3616 3.12111 11.2628C3.83392 11.1311 4.56869 11.1033 5.28077 11.2079C8.29156 11.6477 10.8545 12.9936 13.0031 15.1262C14.2297 16.3403 15.1577 17.7915 16.1135 19.2091C17.13 20.7145 18.2234 22.1489 19.6161 23.325C20.1078 23.737 20.5001 24.0502 20.8755 24.2815C19.7434 24.4081 17.8538 24.4352 16.5613 23.4128V23.4113ZM17.9753 14.3168C17.9753 14.0753 18.1685 13.8828 18.4114 13.8828C18.4663 13.8828 18.5161 13.8938 18.5607 13.9099C18.6215 13.9318 18.6771 13.9648 18.721 14.0145C18.7986 14.0914 18.8425 14.2011 18.8425 14.3168C18.8425 14.5583 18.6493 14.7508 18.4063 14.7508C18.1633 14.7508 17.9753 14.5583 17.9753 14.3168ZM22.367 16.5694C22.0853 16.685 21.8035 16.7838 21.5327 16.7948C21.1127 16.8167 20.6545 16.6462 20.4057 16.4376C20.0193 16.1134 19.7427 15.9319 19.627 15.3662C19.5773 15.1247 19.6051 14.7508 19.649 14.5363C19.7485 14.0745 19.638 13.7781 19.3123 13.5088C19.0474 13.2893 18.71 13.2285 18.3397 13.2285C18.2014 13.2285 18.0748 13.1678 17.9804 13.1187C17.826 13.0419 17.6986 12.8494 17.8201 12.613C17.8589 12.5362 18.047 12.3496 18.0909 12.3167C18.5937 12.0305 19.1733 12.1242 19.7097 12.3386C20.2066 12.5421 20.5828 12.9153 21.1236 13.443C21.6762 14.0804 21.7757 14.256 22.0904 14.7347C22.3392 15.1086 22.5654 15.4928 22.7205 15.9327C22.8142 16.2071 22.6927 16.4318 22.367 16.5694Z"
            fill="currentColor"
        />
    </svg>
);

export const AiIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="AI"
    >
        {/* Large sparkle */}
        <path
            d="M10 6Q11.8 12.2 18 14Q11.8 15.8 10 22Q8.2 15.8 2 14Q8.2 12.2 10 6Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
        />

        {/* Small sparkle */}
        <path
            d="M19 2.5Q19.8 5.2 22.5 6Q19.8 6.8 19 9.5Q18.2 6.8 15.5 6Q18.2 5.2 19 2.5Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
        />
    </svg>
);

export const BeakerIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        role="img"
        aria-label="Laboratory flask"
    >
        <rect x="8" y="2" width="8" height="1.8" rx="0.9" fill="currentColor" />
        <path
            d="M10 3.8v4.8L5.7 14.8C4.9 16.3 6.9 17 8.9 17h6.2c2 0 4-.7 3.2-2.2L14 8.6V3.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
        />
    </svg>
);

export const FlaskIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="Laboratory flask"
    >
        <rect
            x="7.52"
            y="2.16"
            width="8.96"
            height="1.76"
            rx="0.88"
            fill="currentColor"
        />

        <path
            d="M9.6 3.92V10.32L4 18.48Q2.88 20.56 5.44 21.04H18.56Q21.12 20.56 20 18.48L14.4 10.32V3.92"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
        />
    </svg>
);

export const GearIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
    </svg>
);

export const ReloadIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
    </svg>
);

export const DotDotDotIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <circle cx="5" cy="12" r="1.75" />
        <circle cx="12" cy="12" r="1.75" />
        <circle cx="19" cy="12" r="1.75" />
    </svg>
);

export const UploadFileIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => {
    return (
        <svg
            data-testid={dataTestid}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.35}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
        >
            {/* Tray/Base */}
            <path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

            {/* Arrow Up */}
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="13" />
        </svg>
    );
};

export const OpenDocumentIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => {
    return (
        <svg
            data-testid={dataTestid}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.35}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
        >
            {/* Outer rounded document frame */}
            <rect x="4" y="3" width="14" height="16" rx="2" ry="2" />

            {/* Top short line */}
            <path d="M8 7h3" />

            {/* Three longer text lines */}
            <path d="M8 11h6" />
            <path d="M8 14h6" />
        </svg>
    );
};

export const ClosedDocumentIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => {
    return (
        <svg
            data-testid={dataTestid}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.35}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
        >
            {/* Outer rounded document frame */}
            <rect x="4" y="3" width="14" height="16" rx="2" ry="2" />

            {/* Top short line */}
            <path d="M8 7h3" />
        </svg>
    );
};

export const OpenBookIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => {
    return (
        <svg
            data-testid={dataTestid}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
        >
            {/* Outer book cover */}
            <path d="M4 19.5V6.5M20 19.5V6.5M4 19.5h16" />

            {/* Left and Right pages with center spine curve */}
            <path d="M12 5c-2.5-1.2-5.5-1.2-8 0v13c2.5-1.2 5.5-1.2 8 0 2.5-1.2 5.5-1.2 8 0v-13c-2.5-1.2-5.5-1.2-8 0z" />
            <path d="M12 5v13" />

            {/* Text lines - Left page */}
            <path d="M7 8.5h2.5" />
            <path d="M7 11.5h2.5" />
            <path d="M7 14.5h2.5" />

            {/* Text lines - Right page */}
            <path d="M14.5 8.5h2.5" />
            <path d="M14.5 11.5h2.5" />
            <path d="M14.5 14.5h2.5" />
        </svg>
    );
};

export const CheckMarkIcon = ({
    matched,
    'data-testid': dataTestid,
}: { matched: boolean } & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        className={`h-8 w-8 transition-all duration-200 ${
            matched
                ? 'opacity-100 [&_.check-path]:stroke-white dark:[&_.check-path]:stroke-gray-900 [&_.circle-bg]:fill-green-600 [&_.circle-bg]:stroke-green-600 dark:[&_.circle-bg]:fill-green-400 dark:[&_.circle-bg]:stroke-green-400'
                : 'opacity-25'
        }`}
    >
        <circle
            cx="12"
            className="circle-bg"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
        />
        <path
            className="check-path"
            d="M9 12l2 2 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const FlipIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="Flip"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Mirror axis */}
        <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2 2.5" />

        {/* Left triangle */}
        <path d="M9 6L3.5 18H9Z" />

        {/* Right triangle (mirrored) */}
        <path d="M15 6L20.5 18H15Z" />
    </svg>
);

export const PhraseIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="Phrase"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Speech bubble */}
        <path d="M6 4H18A3 3 0 0 1 21 7V14A3 3 0 0 1 18 17H11L7 20.5V17H6A3 3 0 0 1 3 14V7A3 3 0 0 1 6 4Z" />

        {/* Text lines */}
        <line x1="7.5" y1="9" x2="16.5" y2="9" />
        <line x1="7.5" y1="12.5" x2="13" y2="12.5" />
    </svg>
);

export const TextIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="Text"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Top dot */}
        <line x1="12" y1="3" x2="12" y2="4.6" />

        {/* Horizontal bar */}
        <line x1="3.1" y1="5.2" x2="20.9" y2="5.2" />

        {/* Stroke from upper right sweeping down to the lower left */}
        <path d="M17.3 5.7C16.6 10.8 14.8 14.2 11.9 16.5C9.2 18.6 6.8 20.2 4.1 20.8" />

        {/* Stroke from upper left sweeping down to the lower right */}
        <path d="M7.4 9.6C8.6 12.6 10.2 14.8 12.4 16.6C14.6 18.5 17 20 19.7 20.8" />
    </svg>
);

export const WordIcon = ({ 'data-testid': dataTestid }: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="Word"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <g strokeWidth="1.4">
            {/* Left radical 言: dot, three horizontal strokes, box */}
            <line x1="7.2" y1="2.2" x2="7.8" y2="3.2" />
            <line x1="4" y1="4.8" x2="10" y2="4.8" />
            <line x1="4.8" y1="7.4" x2="9.4" y2="7.4" />
            <line x1="4.8" y1="10" x2="9.4" y2="10" />
            <rect x="5" y="12.2" width="4.4" height="5.4" rx="0.4" />

            {/* Right part 司: top bar with hooked right side */}
            <path d="M12.6 4.8H20.2V16.8Q20.2 18.2 18.8 17.9" />
            {/* Inner stroke and box of 司 */}
            <line x1="13" y1="8.2" x2="17" y2="8.2" />
            <rect x="13.4" y="11" width="3.6" height="4.6" rx="0.4" />
        </g>
    </svg>
);

export const CharacterIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="Character"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Top dot */}
        <line x1="12" y1="2.4" x2="12" y2="4" />

        {/* Roof 宀: bar with a short tick down at each end */}
        <path d="M3.6 7V4.8H20.4V7" />

        {/* Top stroke of 子, curving down to the left */}
        <path d="M8.4 10H15.6Q14.6 11.5 12.6 12.4" />

        {/* Long horizontal bar */}
        <line x1="3.8" y1="15.6" x2="20.2" y2="15.6" />

        {/* Vertical stem with a hook to the left */}
        <path d="M12 12.4V20.2Q12 21.6 10.2 21.1" />
    </svg>
);

export const ShuffleIcon = ({
    'data-testid': dataTestid,
}: {} & TestIdProps) => (
    <svg
        data-testid={dataTestid}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        role="img"
        aria-label="Shuffle"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Path from upper left curving down to the lower right */}
        <path d="M3 7H6C10 7 10.5 17 15 17H20" />
        <polyline points="17.5,14.5 20,17 17.5,19.5" />

        {/* Path from lower left curving up to the upper right */}
        <path d="M3 17H6C10 17 10.5 7 15 7H20" />
        <polyline points="17.5,4.5 20,7 17.5,9.5" />
    </svg>
);
