/**
 * RecipientSelector Component
 *
 * Allows users to designate who a token is being purchased for:
 * - For Myself (default)
 * - For Someone in My Circle (logged-in with circle members)
 * - For Someone Else (name input)
 */

import {useState} from 'react';
import {clsx} from 'clsx';
import {Input} from '~/components/ui/Input';
import {
  calculateDaysSober,
  type RecoveryCircleMember,
} from '~/lib/recoveryCircle';
import {Gift, Users, UserPlus, ChevronDown, ChevronUp} from 'lucide-react';

export type RecipientSelection =
  | {type: 'self'}
  | {type: 'circle'; member: RecoveryCircleMember}
  | {type: 'other'; name: string};

interface RecipientSelectorProps {
  circle: RecoveryCircleMember[];
  selectedRecipient: RecipientSelection;
  onChange: (selection: RecipientSelection) => void;
  isLoggedIn: boolean;
}

export function RecipientSelector({
  circle,
  selectedRecipient,
  onChange,
  isLoggedIn,
}: RecipientSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(
    selectedRecipient.type !== 'self',
  );

  const hasCircleMembers = isLoggedIn && circle.length > 0;

  return (
    <div className="border border-black/5 rounded-xl overflow-hidden">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 text-left hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5 text-accent" />
          <div>
            <span className="font-display text-base font-bold text-primary">
              Buying as a Gift?
            </span>
            {selectedRecipient.type !== 'self' && (
              <span className="block text-caption text-accent mt-0.5">
                Gift for{' '}
                {selectedRecipient.type === 'circle'
                  ? selectedRecipient.member.name
                  : selectedRecipient.name}
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-secondary" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* For Myself */}
          <RecipientOption
            selected={selectedRecipient.type === 'self'}
            onClick={() => onChange({type: 'self'})}
            icon={<Gift className="w-4 h-4" />}
            label="For Myself"
            description="Celebrating my own milestone"
          />

          {/* For Someone in My Circle */}
          {hasCircleMembers && (
            <div>
              <RecipientOption
                selected={selectedRecipient.type === 'circle'}
                onClick={() =>
                  onChange({type: 'circle', member: circle[0]})
                }
                icon={<Users className="w-4 h-4" />}
                label="For Someone in My Circle"
                description="Choose from your recovery circle"
              />

              {selectedRecipient.type === 'circle' && (
                <div className="mt-2 ml-8">
                  <select
                    className="w-full h-12 px-4 rounded-lg bg-surface/50 text-body text-primary focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent/20 focus:shadow-sm transition-all duration-200"
                    value={selectedRecipient.member.id}
                    onChange={(e) => {
                      const member = circle.find(
                        (m) => m.id === e.target.value,
                      );
                      if (member) {
                        onChange({type: 'circle', member});
                      }
                    }}
                  >
                    {circle.map((member) => {
                      const days = calculateDaysSober(member.cleanDate);
                      return (
                        <option key={member.id} value={member.id}>
                          {member.name} — {days.toLocaleString()} days sober
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* For Someone Else */}
          <div>
            <RecipientOption
              selected={selectedRecipient.type === 'other'}
              onClick={() => onChange({type: 'other', name: ''})}
              icon={<UserPlus className="w-4 h-4" />}
              label="For Someone Else"
              description="Enter their name"
            />

            {selectedRecipient.type === 'other' && (
              <div className="mt-2 ml-8">
                <Input
                  placeholder="Recipient's name"
                  value={selectedRecipient.name}
                  onChange={(e) =>
                    onChange({type: 'other', name: e.target.value})
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RecipientOption({
  selected,
  onClick,
  icon,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-start gap-3 w-full p-3 rounded-lg border-2 text-left transition-colors',
        selected
          ? 'border-accent bg-accent/5'
          : 'border-black/5 hover:border-accent/30',
      )}
    >
      <div
        className={clsx(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0',
          selected ? 'border-accent bg-accent' : 'border-black/20',
        )}
      >
        {selected && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={clsx('text-body font-medium', selected ? 'text-accent' : 'text-primary')}>
            {label}
          </span>
          <span className={clsx(selected ? 'text-accent' : 'text-secondary')}>
            {icon}
          </span>
        </div>
        <p className="text-caption text-secondary">{description}</p>
      </div>
    </button>
  );
}
