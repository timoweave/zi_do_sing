interface TestIdProps {
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
