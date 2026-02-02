/**
 * EngravingForm Component - Product Personalization
 *
 * Dynamic engraving form that shows different fields based on variant:
 * - Years Only: Years field (1-99)
 * - Name + Years: Name field + Years field
 * - Cleandate + Years: Clean date + Years field
 * - Name + Cleandate + Years: All three fields
 *
 * @see .cursor/skills/product-personalization/SKILL.md
 * @see prd.md Section 8.2
 */

import {useState, useCallback, useMemo} from 'react';
import {clsx} from 'clsx';
import {ChevronDown, Type, MessageSquare, Calendar, User, Hash} from 'lucide-react';

export interface EngravingData {
  name: string;
  years: string;
  cleanDate: string;
  note: string;
}

export const EMPTY_ENGRAVING_DATA: EngravingData = {
  name: '',
  years: '',
  cleanDate: '',
  note: '',
};

interface EngravingFormProps {
  value: EngravingData;
  onChange: (data: EngravingData) => void;
  selectedVariantTitle?: string;
  errors?: Partial<Record<keyof EngravingData, string>>;
  disabled?: boolean;
}

// Variant configurations - what fields to show for each variant
type VariantConfig = {
  showName: boolean;
  showYears: boolean;
  showCleanDate: boolean;
};

function getVariantConfig(variantTitle?: string): VariantConfig {
  const title = variantTitle?.toLowerCase() || '';

  if (title.includes('name') && title.includes('cleandate') && title.includes('years')) {
    return {showName: true, showYears: true, showCleanDate: true};
  }
  if (title.includes('cleandate') && title.includes('years')) {
    return {showName: false, showYears: true, showCleanDate: true};
  }
  if (title.includes('name') && title.includes('years')) {
    return {showName: true, showYears: true, showCleanDate: false};
  }
  // Default: Years Only
  return {showName: false, showYears: true, showCleanDate: false};
}

const MAX_NAME_LENGTH = 10;
const MAX_NOTE_LENGTH = 200;
const NAME_CHARS_REGEX = /^[a-zA-Z\s\-.']*$/;

export function EngravingForm({
  value,
  onChange,
  selectedVariantTitle,
  errors,
  disabled = false,
}: EngravingFormProps) {
  const [isExpanded, setIsExpanded] = useState(
    value.name.length > 0 || value.years.length > 0 || value.cleanDate.length > 0
  );
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof EngravingData, string>>>({});

  const config = useMemo(() => getVariantConfig(selectedVariantTitle), [selectedVariantTitle]);

  // Check if any engraving data is entered
  const hasEngravingData = useMemo(() => {
    if (config.showName && value.name.trim()) return true;
    if (config.showYears && value.years.trim()) return true;
    if (config.showCleanDate && value.cleanDate.trim()) return true;
    return false;
  }, [config, value]);

  // Build preview text
  const previewText = useMemo(() => {
    const parts: string[] = [];
    if (config.showName && value.name.trim()) parts.push(value.name.trim());
    if (config.showCleanDate && value.cleanDate.trim()) parts.push(value.cleanDate.trim());
    if (config.showYears && value.years.trim()) {
      const yearsNum = parseInt(value.years, 10);
      if (!isNaN(yearsNum)) {
        parts.push(`${yearsNum} ${yearsNum === 1 ? 'Year' : 'Years'}`);
      }
    }
    return parts.join(' • ');
  }, [config, value]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;

      if (newName && !NAME_CHARS_REGEX.test(newName)) {
        setLocalErrors(prev => ({
          ...prev,
          name: "Only letters, spaces, and basic punctuation (- . ') allowed",
        }));
        return;
      }

      if (newName.length > MAX_NAME_LENGTH) {
        return;
      }

      setLocalErrors(prev => ({...prev, name: undefined}));
      onChange({...value, name: newName});
    },
    [value, onChange],
  );

  const handleYearsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newYears = e.target.value;

      // Allow empty or numbers only
      if (newYears && !/^\d{0,2}$/.test(newYears)) {
        return;
      }

      // Validate range (1-99)
      if (newYears) {
        const num = parseInt(newYears, 10);
        if (num < 0 || num > 99) {
          return;
        }
      }

      setLocalErrors(prev => ({...prev, years: undefined}));
      onChange({...value, years: newYears});
    },
    [value, onChange],
  );

  const handleCleanDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({...value, cleanDate: e.target.value});
    },
    [value, onChange],
  );

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNote = e.target.value;
      if (newNote.length > MAX_NOTE_LENGTH) {
        return;
      }
      onChange({...value, note: newNote});
    },
    [value, onChange],
  );

  const displayNameError = errors?.name || localErrors.name;
  const displayYearsError = errors?.years || localErrors.years;
  const displayCleanDateError = errors?.cleanDate || localErrors.cleanDate;

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
          <span className="font-medium text-primary">Add Custom Engraving</span>
          {!hasEngravingData && (
            <span className="text-body-sm text-secondary/50">Required</span>
          )}
          {hasEngravingData && previewText && (
            <span className="text-body-sm text-accent bg-accent/10 px-2 py-0.5 rounded max-w-[200px] truncate">
              {previewText}
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
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="px-4 pb-4 pt-4 space-y-4 bg-surface/40 rounded-b-lg">
          {/* Name Field */}
          {config.showName && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="engraving-name"
                  className="flex items-center gap-2 text-body-sm font-semibold text-primary"
                >
                  <User className="w-4 h-4 text-accent" />
                  Name
                </label>
                <span
                  className={clsx(
                    'text-caption',
                    value.name.length >= MAX_NAME_LENGTH ? 'text-error' : 'text-secondary/40',
                  )}
                >
                  {value.name.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
              <input
                id="engraving-name"
                name="engravingName"
                type="text"
                value={value.name}
                onChange={handleNameChange}
                placeholder="e.g., Sarah M."
                disabled={disabled}
                maxLength={MAX_NAME_LENGTH}
                className={clsx(
                  'w-full h-12 px-4 rounded-lg bg-white transition-all duration-200',
                  'text-body text-primary placeholder:text-secondary/50',
                  'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-sm',
                  displayNameError && 'ring-2 ring-error/30 bg-error/5',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface/30',
                )}
              />
              {displayNameError ? (
                <p className="text-body-sm text-error">{displayNameError}</p>
              ) : (
                <p className="text-caption text-secondary/50">
                  Under 10 characters for optimal engraving
                </p>
              )}
            </div>
          )}

          {/* Clean Date Field */}
          {config.showCleanDate && (
            <div className="space-y-1">
              <label
                htmlFor="engraving-cleandate"
                className="flex items-center gap-2 text-body-sm font-semibold text-primary"
              >
                <Calendar className="w-4 h-4 text-accent" />
                Clean Date
              </label>
              <input
                id="engraving-cleandate"
                name="engravingCleanDate"
                type="date"
                value={value.cleanDate}
                onChange={handleCleanDateChange}
                max={new Date().toISOString().split('T')[0]}
                disabled={disabled}
                className={clsx(
                  'w-full h-12 px-4 rounded-lg bg-white transition-all duration-200',
                  'text-body text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-sm',
                  displayCleanDateError && 'ring-2 ring-error/30 bg-error/5',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface/30',
                )}
              />
              {displayCleanDateError ? (
                <p className="text-body-sm text-error">{displayCleanDateError}</p>
              ) : (
                <p className="text-caption text-secondary/50">
                  Your sobriety start date
                </p>
              )}
            </div>
          )}

          {/* Years Field */}
          {config.showYears && (
            <div className="space-y-1">
              <label
                htmlFor="engraving-years"
                className="flex items-center gap-2 text-body-sm font-semibold text-primary"
              >
                <Hash className="w-4 h-4 text-accent" />
                Years
              </label>
              <input
                id="engraving-years"
                name="engravingYears"
                type="number"
                inputMode="numeric"
                min="1"
                max="99"
                value={value.years}
                onChange={handleYearsChange}
                placeholder="e.g., 5"
                disabled={disabled}
                className={clsx(
                  'w-full h-12 px-4 rounded-lg bg-white transition-all duration-200',
                  'text-body text-primary placeholder:text-secondary/50',
                  'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-sm',
                  displayYearsError && 'ring-2 ring-error/30 bg-error/5',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface/30',
                  // Hide number input spinners
                  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                )}
              />
              {displayYearsError ? (
                <p className="text-body-sm text-error">{displayYearsError}</p>
              ) : (
                <p className="text-caption text-secondary/50">
                  Number of years (1-99)
                </p>
              )}
            </div>
          )}

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
                  value.note.length >= MAX_NOTE_LENGTH ? 'text-error' : 'text-secondary/40',
                )}
              >
                {value.note.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
            <textarea
              id="engraving-note"
              name="engravingNote"
              value={value.note}
              onChange={handleNoteChange}
              placeholder="Any special instructions or context for the engraving team..."
              disabled={disabled}
              rows={2}
              maxLength={MAX_NOTE_LENGTH}
              className={clsx(
                'w-full px-4 py-3 rounded-lg bg-white transition-all duration-200 resize-none',
                'text-body text-primary placeholder:text-secondary/50',
                'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-sm',
                errors?.note && 'ring-2 ring-error/30 bg-error/5',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface/30',
              )}
            />
            <p className="text-caption text-secondary/50">
              This note is private and won't appear on the token
            </p>
          </div>

          {/* Preview */}
          {previewText && (
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <p className="text-caption font-semibold text-primary mb-2">Preview</p>
              <p className="font-display text-lg text-primary text-center tracking-wide">
                {previewText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper to check if engraving data is complete based on variant
 */
export function isEngravingComplete(data: EngravingData, variantTitle?: string): boolean {
  const config = getVariantConfig(variantTitle);

  if (config.showName && !data.name.trim()) return false;
  if (config.showYears && !data.years.trim()) return false;
  if (config.showCleanDate && !data.cleanDate.trim()) return false;

  return true;
}

/**
 * Helper to format engraving data for display
 */
export function formatEngravingPreview(data: EngravingData, variantTitle?: string): string {
  const config = getVariantConfig(variantTitle);
  const parts: string[] = [];

  if (config.showName && data.name.trim()) parts.push(data.name.trim());
  if (config.showCleanDate && data.cleanDate.trim()) {
    // Format date nicely
    const date = new Date(data.cleanDate);
    parts.push(date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}));
  }
  if (config.showYears && data.years.trim()) {
    const yearsNum = parseInt(data.years, 10);
    if (!isNaN(yearsNum)) {
      parts.push(`${yearsNum} ${yearsNum === 1 ? 'Year' : 'Years'}`);
    }
  }

  return parts.join(' • ');
}
