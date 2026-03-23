import {Link} from 'react-router';

interface WizardProgressProps {
  steps: readonly string[];
  currentStep: string;
  completedSteps: string[];
  basePath: string;
}

export function WizardProgress({steps, currentStep, completedSteps, basePath}: WizardProgressProps) {
  return (
    <nav aria-label="Wizard progress" style={{marginBottom: '2rem'}}>
      <ol style={{display: 'flex', alignItems: 'center', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0}}>
        {steps.map((step, i) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isAccessible = isCompleted || isCurrent;
          return (
            <li key={step} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              {i > 0 && (
                <div style={{height: '1px', width: '2rem', background: isCompleted ? '#B8764F' : 'rgba(255,255,255,0.08)'}} />
              )}
              {isAccessible && !isCurrent ? (
                <Link
                  to={`${basePath}/${step}`}
                  style={{
                    display: 'flex',
                    height: '2rem',
                    width: '2rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    transition: 'colors 0.2s',
                    textDecoration: 'none',
                    ...(isCompleted
                      ? {background: '#B8764F', color: '#fff'}
                      : {border: '1px solid rgba(255,255,255,0.15)', color: '#fff'}),
                  }}
                  aria-label={`Step ${i + 1}: ${step}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {i + 1}
                </Link>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    height: '2rem',
                    width: '2rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    ...(isCurrent
                      ? {border: '2px solid #B8764F', color: '#B8764F'}
                      : {border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)'}),
                  }}
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
