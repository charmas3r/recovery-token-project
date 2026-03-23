import {useState} from 'react';
import {Button} from '~/components/ui/Button';

interface DesignRefinerProps {
  currentDesignUrl: string;
  refinementsUsed: number;
  maxRefinements: number;
  onRefine: (prompt: string) => void;
  refining?: boolean;
}

export function DesignRefiner({currentDesignUrl, refinementsUsed, maxRefinements, onRefine, refining = false}: DesignRefinerProps) {
  const [prompt, setPrompt] = useState('');
  const remaining = maxRefinements - refinementsUsed;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
      <div style={{position: 'relative', aspectRatio: '1/1', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)'}}>
        <img src={currentDesignUrl} alt="Current token design" style={{height: '100%', width: '100%', objectFit: 'cover'}} />
      </div>
      {remaining > 0 ? (
        <div>
          <label htmlFor="refinement" style={{display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem'}}>
            What would you like to change? ({remaining} refinement{remaining !== 1 ? 's' : ''} remaining)
          </label>
          <textarea id="refinement" value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "Make the eagle larger" or "Add a border around the edge"'
            maxLength={200} rows={3}
            style={{width: '100%', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', color: '#fff', outline: 'none', fontFamily: 'inherit', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box'}} />
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem'}}>
            <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem'}}>{prompt.length}/200</span>
            <Button type="button" variant="secondary" className="!border-accent !text-accent"
              onClick={() => { onRefine(prompt); setPrompt(''); }}
              disabled={!prompt.trim() || refining}>
              {refining ? 'Generating...' : 'Refine Design'}
            </Button>
          </div>
        </div>
      ) : (
        <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', textAlign: 'center'}}>Maximum refinements reached. You can proceed with this design.</p>
      )}
    </div>
  );
}
