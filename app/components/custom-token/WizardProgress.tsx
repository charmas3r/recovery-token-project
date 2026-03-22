import {Link} from 'react-router';

interface WizardProgressProps {
  steps: readonly string[];
  currentStep: string;
  completedSteps: string[];
  basePath: string;
}

export function WizardProgress({steps, currentStep, completedSteps, basePath}: WizardProgressProps) {
  return (
    <nav aria-label="Wizard progress" className="mb-xl">
      <ol className="flex items-center gap-sm">
        {steps.map((step, i) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isAccessible = isCompleted || isCurrent;
          return (
            <li key={step} className="flex items-center gap-sm">
              {i > 0 && (
                <div className={`h-px w-8 ${isCompleted ? 'bg-accent' : 'bg-white/[0.08]'}`} />
              )}
              {isAccessible && !isCurrent ? (
                <Link
                  to={`${basePath}/${step}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted ? 'bg-accent text-white' : 'border border-white/[0.15] text-white'
                  }`}
                  aria-label={`Step ${i + 1}: ${step}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {i + 1}
                </Link>
              ) : (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent ? 'border-2 border-accent text-accent' : 'border border-white/[0.08] text-white/40'
                  }`}
                  aria-label={`Step ${i + 1}: ${step}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {i + 1}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
