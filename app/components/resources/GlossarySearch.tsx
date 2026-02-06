/**
 * GlossarySearch - Search input with clear button for glossary filtering
 */

import {Search, X} from 'lucide-react';
import {clsx} from 'clsx';
import {inputStyles} from '~/components/ui/Input';

interface GlossarySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function GlossarySearch({value, onChange}: GlossarySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50 pointer-events-none" />
      <input
        type="search"
        placeholder="Search terms..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          inputStyles.base,
          inputStyles.text,
          inputStyles.focus,
          '!pl-12 !pr-10',
        )}
        aria-label="Search glossary terms"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-secondary/50 hover:text-primary hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
