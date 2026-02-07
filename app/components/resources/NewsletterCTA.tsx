/**
 * NewsletterCTA - Inline newsletter signup for articles
 *
 * Encourages readers to subscribe for more recovery content.
 * Uses a simple email form with accent styling.
 */

import {useState} from 'react';
import {Mail} from 'lucide-react';
import {Button} from '~/components/ui/Button';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="my-8 rounded-2xl bg-surface p-6 md:p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
          <Mail className="w-6 h-6 text-success" />
        </div>
        <h3 className="font-display text-lg font-bold text-primary mb-2">
          You&apos;re Subscribed
        </h3>
        <p className="text-body text-secondary">
          Thank you for joining our community. We&apos;ll send you new articles
          and recovery resources.
        </p>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-2xl bg-surface p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-primary mb-1">
            Get Recovery Resources in Your Inbox
          </h3>
          <p className="text-body text-secondary leading-relaxed">
            New articles, milestone tips, and community stories — delivered
            monthly.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 shrink-0"
        >
          <label htmlFor="article-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="article-newsletter-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-black/10 bg-white text-body text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent w-full sm:w-auto"
          />
          <Button type="submit" variant="primary" size="md">
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  );
}
