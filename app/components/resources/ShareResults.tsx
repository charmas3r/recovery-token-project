/**
 * ShareResults - Copy-to-clipboard and social share for calculator results
 */

import {useState, useCallback} from 'react';
import {Copy, Check, Share2} from 'lucide-react';
import {Button} from '~/components/ui/Button';

interface ShareResultsProps {
  totalDays: number;
  years: number;
  months: number;
  days: number;
}

export function ShareResults({
  totalDays,
  years,
  months,
  days,
}: ShareResultsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = buildShareText(totalDays, years, months, days);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Recovery Milestone',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    }
  }, [shareText]);

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        variant="secondary"
        size="md"
        onClick={handleCopy}
        aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy Results
          </>
        )}
      </Button>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          variant="secondary"
          size="md"
          onClick={handleNativeShare}
          aria-label="Share results"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      )}
    </div>
  );
}

function buildShareText(
  totalDays: number,
  years: number,
  months: number,
  days: number,
): string {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

  const durationStr = parts.join(', ') || '0 days';

  return `I'm celebrating ${durationStr} of recovery — that's ${totalDays.toLocaleString()} days! Every day counts. 💪 #Recovery #Sobriety`;
}
