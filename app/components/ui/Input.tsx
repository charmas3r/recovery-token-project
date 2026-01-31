/**
 * Input Component - Design System
 * 
 * Follows Recovery Token Store design system specifications
 * @see .cursor/skills/design-system/SKILL.md
 * @see prd.md Section 3
 */

import {clsx} from 'clsx';
import type {InputHTMLAttributes} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
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
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {/* Label */}
      <label
        htmlFor={inputId}
        className="block text-body-sm font-semibold text-primary"
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={inputId}
        name={name}
        className={clsx(
          'w-full h-11 px-4 rounded-md border transition-colors',
          'text-body text-primary placeholder:text-secondary/40',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
          error
            ? 'border-error focus:ring-error'
            : 'border-secondary/20 focus:border-accent',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className,
        )}
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
