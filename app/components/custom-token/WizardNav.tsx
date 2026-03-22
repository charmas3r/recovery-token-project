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
    <div className="flex items-center justify-between mt-xl">
      {backTo ? (
        <Link to={backTo} className="text-white/50 hover:text-white transition-colors text-sm">
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
