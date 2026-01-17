import React from 'react';
import {
  CubeIcon,
  PersonIcon,
  LightningBoltIcon,
  MixIcon,
  TimerIcon,
  MoveIcon,
  Link2Icon,
  TextIcon,
  ChatBubbleIcon,
} from '@radix-ui/react-icons';

// Icon size constants for consistent sizing across the app
export const ICON_SIZE = {
  syntax: { desktop: 20, mobile: 24 },
  action: { desktop: 24, mobile: 28 },
};

// Wrapper for syntax icons with responsive sizing
interface SyntaxIconProps {
  className?: string;
}

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

// Part of Speech Icons using Radix UI
// These icons are semantically chosen to represent each word type

// Noun - CubeIcon (objects/things)
export const IconNoun: React.FC<SyntaxIconProps> = ({ className }) => (
  <CubeIcon className={className} width={20} height={20} />
);

// Pronoun - PersonIcon (people reference)
export const IconPronoun: React.FC<SyntaxIconProps> = ({ className }) => (
  <PersonIcon className={className} width={20} height={20} />
);

// Verb - LightningBoltIcon (action)
export const IconVerb: React.FC<SyntaxIconProps> = ({ className }) => (
  <LightningBoltIcon className={className} width={20} height={20} />
);

// Adjective - MixIcon (describes/modifies - like mixing colors)
export const IconAdj: React.FC<SyntaxIconProps> = ({ className }) => (
  <MixIcon className={className} width={20} height={20} />
);

// Adverb - TimerIcon (how/when actions happen)
export const IconAdverb: React.FC<SyntaxIconProps> = ({ className }) => (
  <TimerIcon className={className} width={20} height={20} />
);

// Preposition - MoveIcon (position/relation)
export const IconPreposition: React.FC<SyntaxIconProps> = ({ className }) => (
  <MoveIcon className={className} width={20} height={20} />
);

// Conjunction - Link2Icon (connects words/clauses)
export const IconConj: React.FC<SyntaxIconProps> = ({ className }) => (
  <Link2Icon className={className} width={20} height={20} />
);

// Article - TextIcon (determines nouns)
export const IconArticle: React.FC<SyntaxIconProps> = ({ className }) => (
  <TextIcon className={className} width={20} height={20} />
);

// Interjection - ChatBubbleIcon (expression/exclamation)
export const IconInterjection: React.FC<SyntaxIconProps> = ({ className }) => (
  <ChatBubbleIcon className={className} width={20} height={20} />
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
