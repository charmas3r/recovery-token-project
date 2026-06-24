/**
 * Ad-landing data
 *
 * Lean, conversion-shaped landing entries for cold paid/social traffic
 * (Meta ads, influencers). Distinct from the content-deep SEO pages in
 * `app/data/seo-pages.ts`: these are single-offer, gift-framed landings
 * rendered by `AdLandingTemplate` via the `/lp/$handle` route.
 *
 * Meta ad-policy note: copy on these surfaces MUST stay gift-framed.
 * No addiction/recovery-treatment claims, no clinical/medical language.
 * "Celebrate a recovery milestone as a gift" is acceptable; framing the
 * product as treatment for addiction is NOT.
 */

export interface AdLandingCTA {
  /** Visible button label. */
  label: string;
  /**
   * Where the CTA goes. The primary CTA posts into the engraving funnel
   * (`/custom-token`); secondary CTAs are simple navigations.
   */
  to: string;
}

export interface AdLandingStep {
  title: string;
  description: string;
}

export interface AdLandingTrustPoint {
  /** Lucide icon name resolved by the template. */
  icon: 'Star' | 'Truck' | 'Shield' | 'Gift' | 'Heart' | 'Sparkles';
  label: string;
}

export interface AdLandingFAQ {
  question: string;
  answer: string;
}

export interface AdLandingTestimonial {
  quote: string;
  name: string;
  rating: number;
}

export interface AdLanding {
  /** URL handle: `/lp/<handle>`. */
  handle: string;

  // Hero
  eyebrow: string;
  headline: string;
  subhead: string;
  primaryCta: AdLandingCTA;
  secondaryCta: AdLandingCTA;

  // Trust + proof
  trustPoints: AdLandingTrustPoint[];
  testimonial: AdLandingTestimonial;

  // Body sections
  howItWorks: AdLandingStep[];
  giftReassurance: {
    eyebrow: string;
    heading: string;
    body: string;
    points: string[];
  };
  faq: AdLandingFAQ[];

  // Final CTA
  finalCta: {
    heading: string;
    subhead: string;
  };

  // Meta / OG
  meta: {
    title: string;
    description: string;
  };
}

const AD_LANDINGS: Record<string, AdLanding> = {
  'recovery-gift': {
    handle: 'recovery-gift',
    eyebrow: 'A gift they keep forever',
    headline: 'Honor their milestone with a coin made just for them',
    subhead:
      'Give someone you love a custom-engraved keepsake coin that marks how far they have come. You choose the words, the date, and the finish — handcrafted and ready to give.',
    primaryCta: {
      label: 'Design their coin',
      to: '/custom-token',
    },
    secondaryCta: {
      label: 'See finished coins',
      to: '/collections/all',
    },
    trustPoints: [
      {icon: 'Star', label: 'Loved by thousands of gift-givers'},
      {icon: 'Truck', label: 'Free shipping, arrives gift-ready'},
      {icon: 'Shield', label: '100% satisfaction guarantee'},
    ],
    testimonial: {
      quote:
        'I had it engraved with her sobriety date and she cried when she opened it. The quality is unreal — it feels like a real heirloom.',
      name: 'Verified Buyer',
      rating: 5,
    },
    howItWorks: [
      {
        title: 'Personalize it',
        description:
          'Add their name, a meaningful date, and a short message. Pick the symbol and finish that feels like them.',
      },
      {
        title: 'We hand-engrave it',
        description:
          'Skilled makers engrave your coin in solid metal — deep, crisp, and built to last a lifetime.',
      },
      {
        title: 'Arrives gift-ready',
        description:
          'It ships in a premium gift box, ready to hand over the moment it lands on your doorstep.',
      },
    ],
    giftReassurance: {
      eyebrow: 'Made to be given',
      heading: 'Premium presentation, zero guesswork',
      body:
        'Every coin arrives in a protective gift box that makes the moment feel as meaningful as it is. No assembly, no extra wrapping — just hand it over.',
      points: [
        'Presented in a premium gift box',
        'Ships ready to give, no wrapping needed',
        'A keepsake they can hold onto for years',
      ],
    },
    faq: [
      {
        question: 'Can I choose exactly what it says?',
        answer:
          'Yes. You pick the name, the date, and a short personal message, plus the symbol and finish. It is engraved exactly as you design it.',
      },
      {
        question: 'How fast does it arrive?',
        answer:
          'Each coin is made to order and ships with free delivery, arriving in a gift box ready to hand over.',
      },
      {
        question: 'What if it is not right?',
        answer:
          'It is backed by our 100% satisfaction guarantee. If you are not happy with your keepsake, we will make it right.',
      },
    ],
    finalCta: {
      heading: 'Make a gift they will never forget',
      subhead:
        'Design a custom keepsake coin in minutes — handcrafted, gift-boxed, and ready to give.',
    },
    meta: {
      title: 'Custom Engraved Milestone Coins — A Gift They Keep Forever',
      description:
        'Design a custom-engraved keepsake coin to celebrate a loved one’s milestone. Personalize the words, date, and finish. Handcrafted, gift-boxed, free shipping.',
    },
  },
};

export function getAdLanding(handle?: string): AdLanding | undefined {
  if (!handle) return undefined;
  return AD_LANDINGS[handle];
}
