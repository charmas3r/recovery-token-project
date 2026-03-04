/**
 * QASection - Product Q&A display with accordion cards
 *
 * Displays answered questions from Shopify metafield data.
 * Matches dark theme card design from ProductReviewsGrid.
 */

import {useState} from 'react';
import {ChevronDown, MessageCircleQuestion, ShieldCheck} from 'lucide-react';
import {clsx} from 'clsx';

export interface QAItem {
  id: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer: string;
  answeredAt: string;
}

interface QASectionProps {
  questions: QAItem[];
  onAskQuestion: () => void;
}

/**
 * Parse and validate Q&A JSON from metafield
 */
export function parseQAMetafield(value: string | null | undefined): QAItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: unknown): item is QAItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as QAItem).id === 'string' &&
        typeof (item as QAItem).question === 'string' &&
        typeof (item as QAItem).answer === 'string' &&
        (item as QAItem).answer.length > 0,
    );
  } catch {
    return [];
  }
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function QASection({questions, onAskQuestion}: QASectionProps) {
  if (questions.length === 0) {
    return <QAEmptyState onAskQuestion={onAskQuestion} />;
  }

  return (
    <div>
      {/* Ask button */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={onAskQuestion}
          className={clsx(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold',
            'border border-white/[0.15] text-white hover:border-accent/40 hover:text-accent',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
          )}
        >
          <MessageCircleQuestion className="w-4 h-4" />
          Ask a Question
        </button>
      </div>

      {/* Q&A Cards */}
      <div className="space-y-4">
        {questions.map((item, index) => (
          <QACard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function QACard({item, index}: {item: QAItem; index: number}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div
      className="rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
        animation: 'fadeInUp 0.5s ease-out forwards',
        animationDelay: `${index * 100}ms`,
        opacity: 0,
      }}
    >
      {/* Question (always visible, clickable) */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6 flex items-start gap-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
        aria-expanded={expanded}
      >
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{backgroundColor: 'rgba(0,242,96,0.15)', color: '#00F260'}}
        >
          Q
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-base leading-snug">
            {item.question}
          </p>
          <p className="text-xs text-white/40 mt-1.5">
            {item.askedBy} &middot; {formatDate(item.askedAt)}
          </p>
        </div>

        <ChevronDown
          className={clsx(
            'w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-200 mt-1',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {/* Answer (expandable) */}
      {expanded && (
        <div className="px-6 pb-6 pt-0 flex items-start gap-4 border-t border-white/[0.05]">
          <span
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-4"
            style={{backgroundColor: 'rgba(184,118,79,0.15)', color: '#B8764F'}}
          >
            A
          </span>

          <div className="flex-1 min-w-0 pt-4">
            <p className="text-white/60 text-sm leading-relaxed">
              {item.answer}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span className="text-xs text-accent font-medium">
                Official Response
              </span>
              {item.answeredAt && (
                <span className="text-xs text-white/30">
                  &middot; {formatDate(item.answeredAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QAEmptyState({onAskQuestion}: {onAskQuestion: () => void}) {
  return (
    <div style={{padding: '3rem 1rem', textAlign: 'center', width: '100%'}}>
      <div style={{marginBottom: '1.5rem'}}>
        <MessageCircleQuestion
          style={{
            width: '3rem',
            height: '3rem',
            color: 'rgba(255,255,255,0.25)',
            margin: '0 auto',
          }}
        />
      </div>
      <h3
        style={{
          fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: '0.75rem',
          textAlign: 'center',
        }}
      >
        Have a Question?
      </h3>
      <p
        style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '1.5rem',
          maxWidth: '28rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        No questions yet — be the first to ask about this product!
      </p>
      <button
        type="button"
        onClick={onAskQuestion}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.75rem',
          backgroundColor: '#00F260',
          color: '#000000',
          borderRadius: '9999px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.85';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        Ask a Question
      </button>
    </div>
  );
}
