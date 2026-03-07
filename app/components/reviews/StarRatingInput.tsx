/**
 * StarRatingInput - Interactive 1-5 star rating selector
 *
 * Keyboard accessible via role="radiogroup" with arrow key navigation.
 * Gold stars when selected, subtle scale animation on click.
 */

import {useState, useCallback} from 'react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  error?: string;
}

const STAR_PATH =
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

export function StarRatingInput({value, onChange, error}: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const [animating, setAnimating] = useState(0);

  const displayValue = hovered || value;

  const handleClick = useCallback(
    (star: number) => {
      onChange(star);
      setAnimating(star);
      setTimeout(() => setAnimating(0), 300);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleClick(Math.min(5, value + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleClick(Math.max(1, value - 1));
      }
    },
    [value, handleClick],
  );

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Rating"
        className="flex gap-1.5"
        onMouseLeave={() => setHovered(0)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= displayValue;
          const isAnimatingUp = animating > 0 && star <= animating;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              tabIndex={-1}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-accent rounded"
              onClick={() => handleClick(star)}
              onMouseEnter={() => setHovered(star)}
              style={{
                transform: isAnimatingUp
                  ? 'scale(1.25)'
                  : hovered === star
                    ? 'scale(1.1)'
                    : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: isAnimatingUp ? `${(star - 1) * 40}ms` : '0ms',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-9 h-9"
                style={{
                  filter: isActive ? 'drop-shadow(0 0 4px rgba(250,204,21,0.3))' : 'none',
                  transition: 'filter 0.15s ease',
                }}
              >
                <path
                  d={STAR_PATH}
                  fill={isActive ? '#facc15' : 'rgba(255,255,255,0.15)'}
                  style={{transition: 'fill 0.15s ease'}}
                />
              </svg>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
