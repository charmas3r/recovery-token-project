import {Link} from 'react-router';
import {Button} from '~/components/ui/Button';

interface WizardNavProps {
  backTo?: string;
  nextLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function WizardNav({backTo, nextLabel = 'Continue', isSubmitting = false, disabled = false}: WizardNavProps) {
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem'}}>
      {backTo ? (
        <Link
          to={backTo}
          style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s'}}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          ← Back
        </Link>
      ) : (
        <div />
      )}
      <Button
        type="submit"
        variant="primary"
        className="!bg-accent !text-white"
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? 'Saving...' : nextLabel}
      </Button>
    </div>
  );
}
