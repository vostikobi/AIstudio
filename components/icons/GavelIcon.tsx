import React from 'react';

const GavelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 7.629l-3.469 3.469-1.414-1.414 3.469-3.469-1.06-1.061-6.718 6.718a1.5 1.5 0 000 2.121l.707.707a1.5 1.5 0 002.121 0l6.718-6.718-1.06-1.06z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.05 13.596l-1.06 1.061 3.182 3.182a1.5 1.5 0 002.121 0l3.182-3.182-1.06-1.06-2.122 2.121z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default GavelIcon;