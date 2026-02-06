/**
 * Milestone Definitions & Calculator - Static Data
 *
 * 15 recovery milestones and a pure calculation function.
 * Ready for Sanity.io CMS integration in Phase 2.
 */

export interface MilestoneDefinition {
  id: string;
  label: string;
  emoji: string;
  days: number;
  description: string;
  shopLink?: {
    label: string;
    href: string;
  };
}

export interface AchievedMilestone {
  milestone: MilestoneDefinition;
  dateAchieved: Date;
}

export interface NextMilestone {
  milestone: MilestoneDefinition;
  targetDate: Date;
  daysRemaining: number;
}

export interface CalculationResult {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  achieved: AchievedMilestone[];
  next: NextMilestone | null;
}

export const MILESTONES: MilestoneDefinition[] = [
  {
    id: '24h',
    label: '24 Hours',
    emoji: '🌅',
    days: 1,
    description: 'The most important day — the first one.',
    shopLink: {label: 'Shop 24-Hour Tokens', href: '/collections'},
  },
  {
    id: '1w',
    label: '1 Week',
    emoji: '🌱',
    days: 7,
    description: 'One full week of strength and courage.',
  },
  {
    id: '30d',
    label: '30 Days',
    emoji: '🌿',
    days: 30,
    description: 'A full month of new habits forming.',
    shopLink: {label: 'Shop 30-Day Tokens', href: '/collections'},
  },
  {
    id: '60d',
    label: '60 Days',
    emoji: '💪',
    days: 60,
    description: 'Two months of growing resilience.',
  },
  {
    id: '90d',
    label: '90 Days',
    emoji: '⭐',
    days: 90,
    description: 'A quarter year — a major milestone in early recovery.',
    shopLink: {label: 'Shop 90-Day Tokens', href: '/collections'},
  },
  {
    id: '6m',
    label: '6 Months',
    emoji: '🔥',
    days: 183,
    description: 'Half a year of dedication and growth.',
    shopLink: {label: 'Shop 6-Month Tokens', href: '/collections'},
  },
  {
    id: '9m',
    label: '9 Months',
    emoji: '🌟',
    days: 274,
    description: 'Three quarters of a year — the home stretch to one year.',
  },
  {
    id: '1y',
    label: '1 Year',
    emoji: '🏆',
    days: 365,
    description: 'One full year — an incredible achievement worth celebrating.',
    shopLink: {label: 'Shop 1-Year Tokens', href: '/collections'},
  },
  {
    id: '18m',
    label: '18 Months',
    emoji: '💎',
    days: 548,
    description: 'A year and a half of unwavering commitment.',
  },
  {
    id: '2y',
    label: '2 Years',
    emoji: '🎯',
    days: 730,
    description: 'Two years of building a new life.',
    shopLink: {label: 'Shop 2-Year Tokens', href: '/collections'},
  },
  {
    id: '5y',
    label: '5 Years',
    emoji: '👑',
    days: 1826,
    description: 'Five years — a testament to enduring strength.',
    shopLink: {label: 'Shop 5-Year Tokens', href: '/collections'},
  },
  {
    id: '10y',
    label: '10 Years',
    emoji: '🏅',
    days: 3652,
    description: 'A decade of recovery — truly inspiring.',
    shopLink: {label: 'Shop 10-Year Tokens', href: '/collections'},
  },
  {
    id: '15y',
    label: '15 Years',
    emoji: '🌈',
    days: 5479,
    description: 'Fifteen years of living proof that recovery works.',
  },
  {
    id: '20y',
    label: '20 Years',
    emoji: '✨',
    days: 7305,
    description: 'Two decades of transformation and service.',
  },
  {
    id: '25y',
    label: '25 Years',
    emoji: '🏛️',
    days: 9131,
    description: 'A quarter century — a legacy of recovery.',
  },
];

/**
 * Calculate milestones based on a sobriety date.
 *
 * Pure function — no side effects, safe for SSR and client.
 */
export function calculateMilestones(sobrietyDate: Date): CalculationResult {
  const now = new Date();
  const diffMs = now.getTime() - sobrietyDate.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Break down into years, months, days
  let years = now.getFullYear() - sobrietyDate.getFullYear();
  let months = now.getMonth() - sobrietyDate.getMonth();
  let days = now.getDate() - sobrietyDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Find achieved milestones
  const achieved: AchievedMilestone[] = MILESTONES.filter(
    (m) => totalDays >= m.days,
  ).map((milestone) => ({
    milestone,
    dateAchieved: new Date(
      sobrietyDate.getTime() + milestone.days * 24 * 60 * 60 * 1000,
    ),
  }));

  // Find next milestone
  const nextDef = MILESTONES.find((m) => totalDays < m.days);
  const next: NextMilestone | null = nextDef
    ? {
        milestone: nextDef,
        targetDate: new Date(
          sobrietyDate.getTime() + nextDef.days * 24 * 60 * 60 * 1000,
        ),
        daysRemaining: nextDef.days - totalDays,
      }
    : null;

  return {totalDays, years, months, days, achieved, next};
}
