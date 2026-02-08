/**
 * Testimonial Content Data
 *
 * Customer testimonials and stories about recovery tokens.
 * Used by the /about/testimonials page.
 */

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  milestone: string;
  location?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testimonial-1',
    quote:
      'Holding my one-year token in my hand made the milestone feel real. It went from an abstract number to something I could see and touch every single day.',
    name: 'Sarah M.',
    milestone: '1 Year',
    location: 'Portland, OR',
  },
  {
    id: 'testimonial-2',
    quote:
      'I keep my token on my nightstand. Every morning it reminds me why I chose this path, and every night it reminds me I made it through another day.',
    name: 'James T.',
    milestone: '6 Months',
    location: 'Austin, TX',
  },
  {
    id: 'testimonial-3',
    quote:
      'My sponsor gave me a Recovery Token for my 90 days. The weight of it, the craftsmanship — it told me someone believed in what I was building.',
    name: 'Maria L.',
    milestone: '90 Days',
    location: 'Chicago, IL',
  },
  {
    id: 'testimonial-4',
    quote:
      'I bought tokens for everyone in my home group when they hit milestones. Watching their faces light up was worth every penny. These are more than gifts.',
    name: 'David K.',
    milestone: '5 Years',
    location: 'Denver, CO',
  },
  {
    id: 'testimonial-5',
    quote:
      'The engraving on the back says "One day at a time." I rub my thumb across those words whenever I need a reminder that I am stronger than I think.',
    name: 'Rachel W.',
    milestone: '2 Years',
  },
  {
    id: 'testimonial-6',
    quote:
      'I was skeptical about buying a recovery token online, but the quality blew me away. It feels like something that will last as long as my sobriety — forever.',
    name: 'Michael P.',
    milestone: '3 Years',
    location: 'Nashville, TN',
  },
  {
    id: 'testimonial-7',
    quote:
      'My daughter gave me a token for my first year sober. I carry it everywhere. It is the most meaningful gift I have ever received.',
    name: 'Linda H.',
    milestone: '1 Year',
    location: 'Seattle, WA',
  },
  {
    id: 'testimonial-8',
    quote:
      'There is something powerful about marking progress with a physical object. My token collection tells the story of the hardest and most rewarding journey of my life.',
    name: 'Chris A.',
    milestone: '10 Years',
    location: 'Boston, MA',
  },
];
