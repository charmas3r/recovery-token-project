/**
 * Accordion Component - Design System
 *
 * Reusable accordion with Framer Motion animations and full accessibility.
 * Supports single-open and multiple-open modes.
 *
 * @see .cursor/skills/design-system/SKILL.md
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  type ReactNode,
} from 'react';
import {motion, AnimatePresence, useReducedMotion} from 'framer-motion';
import {ChevronDown} from 'lucide-react';

/* ==========================================
 * Accordion Context
 * ========================================== */

interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
  reducedMotion: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be used within an Accordion');
  return ctx;
}

/* ==========================================
 * Accordion Root
 * ========================================== */

interface AccordionProps {
  children: ReactNode;
  /** 'single' allows only one item open at a time; 'multiple' allows many */
  type?: 'single' | 'multiple';
  /** ID of the item to open by default */
  defaultOpen?: string;
  className?: string;
}

export function Accordion({
  children,
  type = 'single',
  defaultOpen,
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    defaultOpen ? new Set([defaultOpen]) : new Set(),
  );
  const reducedMotion = useReducedMotion() ?? false;

  const toggle = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (type === 'single') {
            next.clear();
          }
          next.add(id);
        }
        return next;
      });
    },
    [type],
  );

  return (
    <AccordionContext.Provider value={{openItems, toggle, reducedMotion}}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

/* ==========================================
 * Accordion Item
 * ========================================== */

interface AccordionItemProps {
  id: string;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({
  id,
  trigger,
  children,
  className = '',
}: AccordionItemProps) {
  const {openItems, toggle, reducedMotion} = useAccordionContext();
  const isOpen = openItems.has(id);
  const reactId = useId();
  const triggerId = `accordion-trigger-${reactId}`;
  const panelId = `accordion-panel-${reactId}`;

  return (
    <div
      className={`border-b border-black/10 ${className}`}
    >
      {/* Trigger */}
      <button
        id={triggerId}
        type="button"
        onClick={() => toggle(id)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex items-center justify-between w-full py-5 px-1 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 rounded-sm transition-colors"
        style={{minHeight: '44px'}}
      >
        <span className="font-medium text-primary group-hover:text-accent transition-colors pr-4">
          {trigger}
        </span>
        <motion.span
          animate={{rotate: isOpen ? 180 : 0}}
          transition={
            reducedMotion
              ? {duration: 0}
              : {duration: 0.2, ease: 'easeInOut'}
          }
          className="shrink-0 text-secondary"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>

      {/* Content Panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={reducedMotion ? {opacity: 0} : {height: 0, opacity: 0}}
            animate={
              reducedMotion
                ? {opacity: 1}
                : {height: 'auto', opacity: 1}
            }
            exit={reducedMotion ? {opacity: 0} : {height: 0, opacity: 0}}
            transition={
              reducedMotion
                ? {duration: 0.1}
                : {duration: 0.25, ease: [0.22, 1, 0.36, 1]}
            }
            style={{overflow: 'hidden'}}
          >
            <div className="pb-5 px-1 text-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
