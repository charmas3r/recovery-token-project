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
    <div className="space-y-lg">
      <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border border-white/[0.08]">
        <img src={currentDesignUrl} alt="Current token design" className="h-full w-full object-cover" />
      </div>
      {remaining > 0 ? (
        <div>
          <label htmlFor="refinement" className="block text-white text-sm font-medium mb-sm">
            What would you like to change? ({remaining} refinement{remaining !== 1 ? 's' : ''} remaining)
          </label>
          <textarea id="refinement" value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "Make the eagle larger" or "Add a border around the edge"'
            maxLength={200} rows={3}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none" />
          <div className="flex items-center justify-between mt-sm">
            <span className="text-white/30 text-xs">{prompt.length}/200</span>
            <Button type="button" variant="secondary" className="!border-accent !text-accent"
              onClick={() => { onRefine(prompt); setPrompt(''); }}
              disabled={!prompt.trim() || refining}>
              {refining ? 'Generating...' : 'Refine Design'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-white/50 text-sm text-center">Maximum refinements reached. You can proceed with this design.</p>
      )}
    </div>
  );
}
