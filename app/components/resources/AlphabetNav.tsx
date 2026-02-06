/**
 * AlphabetNav - A-Z jump navigation for the glossary
 */

import {clsx} from 'clsx';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface AlphabetNavProps {
  activeLetters: Set<string>;
}

export function AlphabetNav({activeLetters}: AlphabetNavProps) {
  return (
    <nav
      aria-label="Jump to letter"
      className="flex flex-wrap gap-1 justify-center"
    >
      {ALPHABET.map((letter) => {
        const isActive = activeLetters.has(letter);
        return isActive ? (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className={clsx(
              'w-9 h-9 flex items-center justify-center rounded-lg text-body-sm font-semibold transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
              'text-accent hover:bg-accent/10',
            )}
          >
            {letter}
          </a>
        ) : (
          <span
            key={letter}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-body-sm text-secondary/30"
            aria-hidden="true"
          >
            {letter}
          </span>
        );
      })}
    </nav>
  );
}
