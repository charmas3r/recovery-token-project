import {Link} from 'react-router';

interface WizardNavProps {
  backTo?: string;
  nextLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function WizardNav({backTo, nextLabel = 'Continue', isSubmitting = false, disabled = false}: WizardNavProps) {
  const isDisabled = disabled || isSubmitting;

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
      <button
        type="submit"
        disabled={isDisabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.75rem',
          border: 'none',
          background: '#B8764F',
          color: '#000000',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.4 : 1,
          transition: 'opacity 0.2s',
          minHeight: '44px',
        }}
      >
        {isSubmitting ? 'Saving...' : nextLabel}
      </button>
    </div>
  );
}
