import React from 'react';

const VerifiedIcon: React.FC<{ className?: string; title?: string }> = ({ className, title }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        viewBox="0 0 20 20" 
        fill="currentColor"
    >
        {title && <title>{title}</title>}
        <path 
            fillRule="evenodd" 
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM13.486 9.486a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06l1.97 1.97 3.97-3.97a.75.75 0 111.06 1.06l-4.5 4.5z" 
            clipRule="evenodd" 
        />
    </svg>
);

export default VerifiedIcon;