/**
 * ProductCTABlock - Inline product recommendation block within articles
 *
 * Creates natural product discovery pathways through contextual store backlinks.
 * Visually distinct from article content with accent border and background.
 */

import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {Button} from '~/components/ui/Button';

interface ProductCTABlockProps {
  heading: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export function ProductCTABlock({
  heading,
  description,
  buttonText,
  buttonHref,
}: ProductCTABlockProps) {
  return (
    <div className="my-8 rounded-2xl border border-accent/20 bg-accent/5 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-primary mb-1">
            {heading}
          </h3>
          <p className="text-body text-secondary leading-relaxed">
            {description}
          </p>
        </div>
        <div className="shrink-0">
          <Link to={buttonHref}>
            <Button variant="primary" size="md">
              {buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
