/**
 * TableOfContents - Sticky sidebar TOC with active heading tracking
 *
 * Desktop (lg+): Sticky sidebar with smooth scroll anchor links
 * Mobile: <details>/<summary> disclosure element above content
 * Active heading tracked via IntersectionObserver.
 */

import {useState, useEffect} from 'react';
import {List} from 'lucide-react';
import {clsx} from 'clsx';

interface TOCHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  headings: TOCHeading[];
}

export function TableOfContents({headings}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  function scrollToHeading(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({behavior: 'smooth'});
    }
  }

  const tocList = (
    <nav aria-label="Table of contents">
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              type="button"
              onClick={() => scrollToHeading(heading.id)}
              className={clsx(
                'block w-full text-left py-1.5 text-body-sm transition-colors duration-150',
                heading.level === 3 && 'pl-4',
                activeId === heading.id
                  ? 'text-accent font-medium'
                  : 'text-secondary hover:text-primary',
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile: disclosure element */}
      <div className="lg:hidden mb-8">
        <details className="bg-surface rounded-xl p-4">
          <summary className="flex items-center gap-2 cursor-pointer text-body font-medium text-primary select-none">
            <List className="w-4 h-4" />
            Table of Contents
          </summary>
          <div className="mt-3 pt-3 border-t border-black/5">{tocList}</div>
        </details>
      </div>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block sticky top-24 self-start">
        <p className="text-caption uppercase tracking-wider text-secondary font-semibold mb-3">
          Contents
        </p>
        {tocList}
      </aside>
    </>
  );
}
