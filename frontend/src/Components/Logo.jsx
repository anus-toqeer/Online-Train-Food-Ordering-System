function Logo({ size = 40 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            style={{ display: 'block' }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="48" height="48" rx="15" fill="#0F3B2E" />
            <circle cx="24" cy="20" r="10" fill="#E3A639" />
            <path
                d="M19 14v6M19 14a1.5 1.5 0 0 0-1.5 1.5V17M19 14a1.5 1.5 0 0 1 1.5 1.5V17M19 17v7"
                stroke="#0F3B2E"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M28.5 14c-1.4 0-2.5 1.3-2.5 3s1.1 3 2.5 3v4"
                stroke="#0F3B2E"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="6" y1="36" x2="42" y2="36" stroke="#3E9169" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="32" x2="12" y2="40" stroke="#3E9169" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="24" y1="32" x2="24" y2="40" stroke="#3E9169" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="32" x2="36" y2="40" stroke="#3E9169" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

export default Logo;