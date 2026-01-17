import React from 'react';

// Icon size constants for consistent sizing across the app
export const ICON_SIZE = {
  syntax: { desktop: 20, mobile: 24 },
  action: { desktop: 24, mobile: 28 },
};

// Wrapper for syntax icons with responsive sizing
interface SyntaxIconProps {
  className?: string;
}

// Text abbreviation style for part-of-speech icons
const textIconStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontWeight: 700,
  fontSize: '12px',
  letterSpacing: '-0.02em',
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '20px',
  height: '20px',
};

// Action Icons
export const IconEyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const IconStrike = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4H9a3 3 0 0 0 0 6h6" />
    <path d="M4 12h16" />
    <path d="M8 20h7a3 3 0 0 0 0-6H9" />
  </svg>
);

export const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m8 17 4 4 4-4" />
  </svg>
);

export const IconWidth = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12H2" />
    <path d="M5 15l-3-3 3-3" />
    <path d="M19 9l3 3-3 3" />
  </svg>
);

export const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

// Part of Speech Icons using text abbreviations
// Clear, readable labels for each word type

// Noun - "N"
export const IconNoun: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={textIconStyle}>N</span>
);

// Pronoun - "Pron"
export const IconPronoun: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={{ ...textIconStyle, fontSize: '10px', minWidth: '28px' }}>Pron</span>
);

// Verb - "V"
export const IconVerb: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={textIconStyle}>V</span>
);

// Adjective - "Adj"
export const IconAdj: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={{ ...textIconStyle, fontSize: '11px', minWidth: '24px' }}>Adj</span>
);

// Adverb - "Adv"
export const IconAdverb: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={{ ...textIconStyle, fontSize: '11px', minWidth: '24px' }}>Adv</span>
);

// Preposition - "Prep"
export const IconPreposition: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={{ ...textIconStyle, fontSize: '10px', minWidth: '28px' }}>Prep</span>
);

// Conjunction - "Conj"
export const IconConj: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={{ ...textIconStyle, fontSize: '10px', minWidth: '28px' }}>Conj</span>
);

// Article - "Art"
export const IconArticle: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={{ ...textIconStyle, fontSize: '11px', minWidth: '24px' }}>Art</span>
);

// Interjection - "Int"
export const IconInterjection: React.FC<SyntaxIconProps> = ({ className }) => (
  <span className={className} style={{ ...textIconStyle, fontSize: '11px', minWidth: '24px' }}>Int</span>
);

export const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Info icon for legend
export const IconInfo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);
