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
      <div className="my-8 rounded-2xl p-6 md:p-8 text-center border border-white/[0.08]" style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
          <Mail className="w-6 h-6 text-success" />
        </div>
        <h3 className="font-display text-lg font-bold text-white mb-2">
          You&apos;re Subscribed
        </h3>
        <p className="text-body text-white/50">
          Thank you for joining our community. We&apos;ll send you new articles
          and recovery resources.
        </p>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-2xl p-6 md:p-8 border border-white/[0.08]" style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-white mb-1">
            Get Recovery Resources in Your Inbox
          </h3>
          <p className="text-body text-white/50 leading-relaxed">
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
            className="px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.05] text-body text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08] w-full sm:w-auto"
          />
          <Button type="submit" variant="primary" size="md">
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  );
}
