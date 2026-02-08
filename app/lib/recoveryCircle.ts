import {z} from 'zod';

export interface RecoveryCircleMember {
  id: string;
  name: string;
  cleanDate: string; // ISO date string
  relationship: string;
  recoveryProgram?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecoveryCircle = RecoveryCircleMember[];

export const RELATIONSHIP_OPTIONS = [
  {value: 'spouse', label: 'Spouse / Partner'},
  {value: 'parent', label: 'Parent'},
  {value: 'child', label: 'Son / Daughter'},
  {value: 'sibling', label: 'Sibling'},
  {value: 'friend', label: 'Friend'},
  {value: 'sponsor', label: 'Sponsor'},
  {value: 'sponsee', label: 'Sponsee'},
  {value: 'colleague', label: 'Colleague'},
  {value: 'other', label: 'Other'},
] as const;

export const RECOVERY_PROGRAM_OPTIONS = [
  {value: 'AA', label: 'Alcoholics Anonymous (AA)'},
  {value: 'NA', label: 'Narcotics Anonymous (NA)'},
  {value: 'SMART', label: 'SMART Recovery'},
  {value: 'Celebrate Recovery', label: 'Celebrate Recovery'},
  {value: 'Refuge Recovery', label: 'Refuge Recovery'},
  {value: 'Other', label: 'Other'},
  {value: 'None', label: 'Prefer not to say'},
] as const;

export const recoveryCircleMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  cleanDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, 'Clean date must be a valid date in the past'),
  relationship: z.string().min(1, 'Please select a relationship'),
  recoveryProgram: z.string().optional(),
});

export function parseRecoveryCircle(value: string | null | undefined): RecoveryCircle {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecoveryCircle;
  } catch {
    return [];
  }
}

export function serializeRecoveryCircle(circle: RecoveryCircle): string {
  return JSON.stringify(circle);
}

export function generateMemberId(): string {
  return `rc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function calculateDaysSober(cleanDate: string): number {
  const start = new Date(cleanDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Standard sobriety milestones in days
 */
const MILESTONES = [
  {days: 30, label: '30 Days'},
  {days: 60, label: '60 Days'},
  {days: 90, label: '90 Days'},
  {days: 180, label: '6 Months'},
  {days: 365, label: '1 Year'},
  {days: 547, label: '18 Months'},
  {days: 730, label: '2 Years'},
  {days: 1095, label: '3 Years'},
  {days: 1825, label: '5 Years'},
  {days: 3650, label: '10 Years'},
  {days: 7300, label: '20 Years'},
  {days: 9125, label: '25 Years'},
];

export function getNextMilestone(cleanDate: string): {days: number; label: string; daysUntil: number} | null {
  const daysSober = calculateDaysSober(cleanDate);

  for (const milestone of MILESTONES) {
    if (milestone.days > daysSober) {
      return {
        ...milestone,
        daysUntil: milestone.days - daysSober,
      };
    }
  }

  // Past all standard milestones, calculate next 5-year milestone
  const years = Math.floor(daysSober / 365);
  const nextMilestoneYears = Math.ceil((years + 1) / 5) * 5;
  const nextMilestoneDays = nextMilestoneYears * 365;
  return {
    days: nextMilestoneDays,
    label: `${nextMilestoneYears} Years`,
    daysUntil: nextMilestoneDays - daysSober,
  };
}

export function getRelationshipLabel(value: string): string {
  const option = RELATIONSHIP_OPTIONS.find((o) => o.value === value);
  return option?.label ?? value;
}
