/**
 * Utility Functions - Design System
 * 
 * @see .cursor/skills/design-system/SKILL.md
 */

import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * 
 * Combines clsx for conditional classes and tailwind-merge to handle
 * conflicting Tailwind classes properly.
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // => conditional
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
