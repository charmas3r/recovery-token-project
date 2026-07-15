import type {AppSession} from '~/lib/session';

const SESSION_KEY = 'customToken';

export interface CustomTokenSession {
  path: 'we-design' | 'you-design';
  material?: 'brass' | 'color';
  variantId?: string;

  // "We Design" fields
  occasion?: string;
  description?: string;
  inspirationImageIds?: string[];
  inspirationImageUrls?: Record<string, string>;
  contactEmail?: string;
  engraving?: {
    name?: string;
    years?: string;
    symbol?: 'aa' | 'na' | 'other';
    note?: string;
  };

  // "You Design" fields
  designPrompt?: string;
  referenceImageIds?: string[];
  previewImageIds?: string[];
  selectedPreviewId?: string;
  refinementPrompts?: string[];
  finalDesignId?: string;

  // Metadata
  generationCount?: number;
  startedAt?: string;
}

const WE_DESIGN_STEPS = ['occasion', 'description', 'material', 'engraving', 'review'] as const;
const YOU_DESIGN_STEPS = ['describe', 'material', 'preview', 'refine', 'review'] as const;

export function getCustomTokenSession(session: AppSession): CustomTokenSession | null {
  return session.get(SESSION_KEY) ?? null;
}

export function updateCustomTokenSession(
  session: AppSession,
  data: Partial<CustomTokenSession>,
): void {
  const current = getCustomTokenSession(session) ?? ({} as CustomTokenSession);
  session.set(SESSION_KEY, {...current, ...data});
}

export function clearCustomTokenSession(session: AppSession): void {
  session.unset(SESSION_KEY);
}

export function getSteps(path: 'we-design' | 'you-design') {
  return path === 'we-design' ? WE_DESIGN_STEPS : YOU_DESIGN_STEPS;
}

export function getCompletedSteps(data: CustomTokenSession): string[] {
  const completed: string[] = [];

  if (data.path === 'we-design') {
    if (data.occasion) completed.push('occasion');
    if (data.description) completed.push('description');
    if (data.material && data.variantId) completed.push('material');
    if (data.engraving) completed.push('engraving');
  } else {
    if (data.designPrompt) completed.push('describe');
    if (data.material && data.variantId) completed.push('material');
    if (data.selectedPreviewId) completed.push('preview');
    if (data.finalDesignId) completed.push('refine');
  }

  return completed;
}

export function canProceedToStep(
  data: CustomTokenSession | null,
  step: string,
): boolean {
  if (!data) return false;

  const steps = getSteps(data.path);
  const stepIndex = steps.indexOf(step as any);
  if (stepIndex <= 0) return true; // First step is always accessible

  // All previous steps must be completed
  const completed = getCompletedSteps(data);
  for (let i = 0; i < stepIndex; i++) {
    if (!completed.includes(steps[i])) return false;
  }
  return true;
}
