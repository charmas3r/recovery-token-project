/**
 * CategoryPills - Horizontal category filter pills for the glossary
 */

import {clsx} from 'clsx';
import type {GlossaryCategory} from '~/data/glossary-terms';

interface CategoryPillsProps {
  categories: GlossaryCategory[];
  activeCategory: GlossaryCategory | null;
  onSelect: (category: GlossaryCategory | null) => void;
}

export function CategoryPills({
  categories,
  activeCategory,
  onSelect,
}: CategoryPillsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by category"
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={clsx(
          'inline-flex items-center px-4 py-2 rounded-full text-body-sm font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black',
          activeCategory === null
            ? 'bg-white/[0.15] text-white'
            : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.08] hover:text-white',
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={clsx(
            'inline-flex items-center px-4 py-2 rounded-full text-body-sm font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black',
            activeCategory === category
              ? 'bg-white/[0.15] text-white'
              : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.08] hover:text-white',
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
