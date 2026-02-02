/**
 * EngravingForm Component - Product Personalization
 *
 * Collapsible form for adding custom engraving to tokens
 * @see .cursor/skills/product-personalization/SKILL.md
 * @see prd.md Section 8.2
 */

import {useState, useCallback} from 'react';
import {clsx} from 'clsx';
import {ChevronDown, Type, MessageSquare} from 'lucide-react';

export interface EngravingData {
  engravingText: string;
  engravingNote: string;
}

interface EngravingFormProps {
  value: EngravingData;
  onChange: (data: EngravingData) => void;
  errors?: {
    engravingText?: string;
    engravingNote?: string;
  };
  disabled?: boolean;
}

const MAX_ENGRAVING_LENGTH = 50;
const MAX_NOTE_LENGTH = 200;
const ALLOWED_CHARS_REGEX = /^[a-zA-Z0-9\s\-.'&,]*$/;

export function EngravingForm({
  value,
  onChange,
  errors,
  disabled = false,
}: EngravingFormProps) {
  const [isExpanded, setIsExpanded] = useState(value.engravingText.length > 0);
  const [localErrors, setLocalErrors] = useState<{
    engravingText?: string;
  }>({});

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newText = e.target.value;

      // Validate allowed characters
      if (newText && !ALLOWED_CHARS_REGEX.test(newText)) {
        setLocalErrors({
          engravingText:
            "Only letters, numbers, spaces, and basic punctuation (- . ' & ,) allowed",
        });
        return;
      }

      // Enforce max length
      if (newText.length > MAX_ENGRAVING_LENGTH) {
        return;
      }

      setLocalErrors({});
      onChange({...value, engravingText: newText});
    },
    [value, onChange],
  );

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNote = e.target.value;
      if (newNote.length > MAX_NOTE_LENGTH) {
        return;
      }
      onChange({...value, engravingNote: newNote});
    },
    [value, onChange],
  );

  const displayError = errors?.engravingText || localErrors.engravingText;

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-3 flex items-center justify-between',
          'bg-surface/30 hover:bg-surface/60 transition-colors rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        aria-expanded={isExpanded}
        aria-controls="engraving-form-content"
      >
        <div className="flex items-center gap-3">
          <Type className="w-5 h-5 text-accent" />
          <span className="font-medium text-primary">
            Add Custom Engraving
          </span>
          <span className="text-body-sm text-secondary/50">
            Optional
          </span>
          {value.engravingText && (
            <span className="text-body-sm text-accent bg-accent/10 px-2 py-0.5 rounded">
              "{value.engravingText}"
            </span>
          )}
        </div>
        <ChevronDown
          className={clsx(
            'w-5 h-5 text-secondary/40 transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {/* Expandable Content */}
      <div
        id="engraving-form-content"
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-out',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="px-4 pb-4 pt-4 space-y-4 bg-surface/40 rounded-b-lg">
          {/* Engraving Text Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="engraving-text"
                className="block text-body-sm font-semibold text-primary"
              >
                Engraving Text
              </label>
              <span
                className={clsx(
                  'text-caption',
                  value.engravingText.length >= MAX_ENGRAVING_LENGTH
                    ? 'text-error'
                    : 'text-secondary/40',
                )}
              >
                {value.engravingText.length}/{MAX_ENGRAVING_LENGTH}
              </span>
            </div>
            <input
              id="engraving-text"
              name="engravingText"
              type="text"
              value={value.engravingText}
              onChange={handleTextChange}
              placeholder="e.g., Sarah M. - 1 Year - 03/15/2026"
              disabled={disabled}
              maxLength={MAX_ENGRAVING_LENGTH}
              aria-describedby="engraving-help"
              className={clsx(
                'w-full h-11 px-4 rounded-md border transition-colors',
                'text-body text-primary placeholder:text-secondary/80',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                displayError
                  ? 'border-error focus:ring-error'
                  : 'border-black/10 focus:border-accent',
                'disabled:opacity-40 disabled:cursor-not-allowed',
              )}
            />
            {displayError && (
              <p className="text-body-sm text-error">{displayError}</p>
            )}
            <p id="engraving-help" className="text-caption text-secondary/50">
              Letters, numbers, spaces, and basic punctuation (- . ' & ,)
            </p>
          </div>

          {/* Private Note (Optional) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="engraving-note"
                className="flex items-center gap-2 text-body-sm font-semibold text-primary"
              >
                <MessageSquare className="w-4 h-4 text-secondary" />
                Private Note to Engraver
                <span className="font-normal text-secondary/60">(Optional)</span>
              </label>
              <span
                className={clsx(
                  'text-caption',
                  value.engravingNote.length >= MAX_NOTE_LENGTH
                    ? 'text-error'
                    : 'text-secondary/40',
                )}
              >
                {value.engravingNote.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
            <textarea
              id="engraving-note"
              name="engravingNote"
              value={value.engravingNote}
              onChange={handleNoteChange}
              placeholder="Any special instructions or context for the engraving team..."
              disabled={disabled}
              rows={2}
              maxLength={MAX_NOTE_LENGTH}
              className={clsx(
                'w-full px-4 py-3 rounded-md border transition-colors resize-none',
                'text-body text-primary placeholder:text-secondary/80',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                errors?.engravingNote
                  ? 'border-error focus:ring-error'
                  : 'border-black/10 focus:border-accent',
                'disabled:opacity-40 disabled:cursor-not-allowed',
              )}
              aria-describedby="note-help"
            />
            <p id="note-help" className="text-caption text-secondary/50">
              This note is private and won't appear on the token or packing slip.
            </p>
          </div>

          {/* Preview */}
          {value.engravingText && (
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <p className="text-caption font-semibold text-primary mb-2">
                Preview
              </p>
              <p className="font-display text-lg text-primary text-center tracking-wide">
                {value.engravingText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
