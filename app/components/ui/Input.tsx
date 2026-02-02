/**
 * Input Component - Design System
 *
 * Modern, sleek input styling without harsh borders.
 * Uses subtle backgrounds and clean focus states.
 *
 * @see .cursor/skills/design-system/SKILL.md
 * @see prd.md Section 3
 */

import {clsx} from 'clsx';
import type {InputHTMLAttributes, TextareaHTMLAttributes} from 'react';

/**
 * Shared input styles for consistency across all form inputs
 */
export const inputStyles = {
  base: 'w-full h-12 px-4 rounded-lg bg-surface/50 transition-all duration-200',
  text: 'text-body text-primary placeholder:text-secondary/50',
  focus: 'focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent/20 focus:shadow-sm',
  disabled: 'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface/30',
  error: 'ring-2 ring-error/30 bg-error/5',
};

export const textareaStyles = {
  base: 'w-full px-4 py-3 rounded-lg bg-surface/50 transition-all duration-200 resize-none',
  text: 'text-body text-primary placeholder:text-secondary/50',
  focus: 'focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent/20 focus:shadow-sm',
  disabled: 'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface/30',
  error: 'ring-2 ring-error/30 bg-error/5',
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  name,
  ...props
}: InputProps) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  const inputClasses = clsx(
    inputStyles.base,
    inputStyles.text,
    inputStyles.focus,
    inputStyles.disabled,
    error && inputStyles.error,
    className,
  );

  // If no label, just return the input
  if (!label) {
    return (
      <input
        id={inputId}
        name={name}
        className={inputClasses}
        {...props}
      />
    );
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <label
        htmlFor={inputId}
        className="block text-body-sm font-medium text-primary"
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={inputId}
        name={name}
        className={inputClasses}
        {...props}
      />

      {/* Helper text or error */}
      {(helperText || error) && (
        <p
          className={clsx(
            'text-body-sm',
            error ? 'text-error' : 'text-secondary/60',
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Textarea Component - Matches Input styling
 */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className,
  id,
  name,
  rows = 5,
  ...props
}: TextareaProps) {
  const textareaId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  const textareaClasses = clsx(
    textareaStyles.base,
    textareaStyles.text,
    textareaStyles.focus,
    textareaStyles.disabled,
    error && textareaStyles.error,
    className,
  );

  if (!label) {
    return (
      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
    );
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={textareaId}
        className="block text-body-sm font-medium text-primary"
      >
        {label}
      </label>

      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        className={textareaClasses}
        {...props}
      />

      {(helperText || error) && (
        <p
          className={clsx(
            'text-body-sm',
            error ? 'text-error' : 'text-secondary/60',
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
