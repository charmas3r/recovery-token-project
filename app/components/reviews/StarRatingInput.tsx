/**
 * StarRatingInput - Interactive 1-5 star rating selector
 *
 * Keyboard accessible via role="radiogroup" with arrow key navigation.
 * Uses yellow-400 stars matching the existing review display pattern.
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

  const displayValue = hovered || value;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(Math.min(5, value + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(Math.max(1, value - 1));
      }
    },
    [value, onChange],
  );

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Rating"
        className="flex gap-1"
        onMouseLeave={() => setHovered(0)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            tabIndex={-1}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 transition-colors"
              style={{
                color: star <= displayValue ? '#facc15' : '#d1d5db',
                fill: star <= displayValue ? '#facc15' : '#d1d5db',
              }}
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
