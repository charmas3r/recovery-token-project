/**
 * RecipientSelector Component
 *
 * Allows users to designate who a token is being purchased for:
 * - For Myself (default)
 * - For Someone in My Circle (logged-in with circle members)
 * - For Someone Else (name input, with opt-in to add to Recovery Circle)
 */

import {useState} from 'react';
import {clsx} from 'clsx';
import {Input} from '~/components/ui/Input';
import {
  calculateDaysSober,
  RELATIONSHIP_OPTIONS,
  type RecoveryCircleMember,
} from '~/lib/recoveryCircle';
import {Gift, Users, UserPlus, ChevronDown, ChevronUp, Heart} from 'lucide-react';

export type RecipientSelection =
  | {type: 'self'}
  | {type: 'circle'; member: RecoveryCircleMember}
  | {type: 'other'; name: string};

export interface CircleAddData {
  name: string;
  relationship?: string;
  cleanDate?: string;
}

interface RecipientSelectorProps {
  circle: RecoveryCircleMember[];
  selectedRecipient: RecipientSelection;
  onChange: (selection: RecipientSelection) => void;
  isLoggedIn: boolean;
  onCircleAddChange?: (data: CircleAddData | null) => void;
}

export function RecipientSelector({
  circle,
  selectedRecipient,
  onChange,
  isLoggedIn,
  onCircleAddChange,
}: RecipientSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(
    selectedRecipient.type !== 'self',
  );
  const [addToCircle, setAddToCircle] = useState(false);
  const [circleRelationship, setCircleRelationship] = useState('');
  const [circleCleanDate, setCircleCleanDate] = useState('');

  const hasCircleMembers = isLoggedIn && circle.length > 0;

  // Notify parent when circle add data changes
  const handleAddToCircleToggle = (checked: boolean) => {
    setAddToCircle(checked);
    if (checked && selectedRecipient.type === 'other' && selectedRecipient.name.trim()) {
      onCircleAddChange?.({
        name: selectedRecipient.name.trim(),
        relationship: circleRelationship || undefined,
        cleanDate: circleCleanDate || undefined,
      });
    } else {
      onCircleAddChange?.(null);
    }
  };

  const handleCircleFieldChange = (relationship: string, cleanDate: string, recipientName: string) => {
    if (addToCircle && recipientName.trim()) {
      onCircleAddChange?.({
        name: recipientName.trim(),
        relationship: relationship || undefined,
        cleanDate: cleanDate || undefined,
      });
    }
  };

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 text-left hover:bg-white/[0.05] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5 text-accent" />
          <div>
            <span className="font-display text-base font-bold text-white">
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
          <ChevronUp className="w-5 h-5 text-white/50" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/50" />
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
                    className="w-full h-12 px-4 rounded-lg bg-white/[0.05] text-body text-white focus:outline-none focus:bg-white/[0.08] focus:ring-2 focus:ring-accent/20 transition-all duration-200"
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
              onClick={() => {
                onChange({type: 'other', name: ''});
                setAddToCircle(false);
                onCircleAddChange?.(null);
              }}
              icon={<UserPlus className="w-4 h-4" />}
              label="For Someone Else"
              description="Enter their name"
            />

            {selectedRecipient.type === 'other' && (
              <div className="mt-2 ml-8 space-y-3">
                <Input
                  placeholder="Recipient's name"
                  value={selectedRecipient.name}
                  onChange={(e) => {
                    onChange({type: 'other', name: e.target.value});
                    handleCircleFieldChange(circleRelationship, circleCleanDate, e.target.value);
                  }}
                />

                {/* Add to Recovery Circle opt-in (logged-in users only) */}
                {isLoggedIn && selectedRecipient.name.trim().length >= 2 && (
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addToCircle}
                        onChange={(e) => handleAddToCircleToggle(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-white/20 text-accent focus:ring-accent/30 accent-[#FFFF93]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-body font-medium text-white">
                            Add to my Recovery Circle
                          </span>
                          <Heart className="w-4 h-4 text-accent" />
                        </div>
                        <p className="text-caption text-white/50 mt-1 leading-relaxed">
                          Your Recovery Circle helps you track milestones for people you care
                          about — see their journey, gift history, and upcoming celebrations.
                          Only a nickname is needed. No personal identification data is stored.
                        </p>
                      </div>
                    </label>

                    {/* Expanded circle fields */}
                    {addToCircle && (
                      <div className="ml-7 space-y-3">
                        <div>
                          <label className="block text-caption font-medium text-white/50 mb-1">
                            Relationship (optional)
                          </label>
                          <select
                            value={circleRelationship}
                            onChange={(e) => {
                              setCircleRelationship(e.target.value);
                              handleCircleFieldChange(e.target.value, circleCleanDate, selectedRecipient.name);
                            }}
                            className="w-full h-10 px-3 rounded-lg bg-white/[0.05] text-body text-white border border-white/[0.1] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all duration-200"
                          >
                            <option value="">Select relationship...</option>
                            {RELATIONSHIP_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-caption font-medium text-white/50 mb-1">
                            Clean/Sobriety Date (optional)
                          </label>
                          <input
                            type="date"
                            value={circleCleanDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              setCircleCleanDate(e.target.value);
                              handleCircleFieldChange(circleRelationship, e.target.value, selectedRecipient.name);
                            }}
                            className="w-full h-10 px-3 rounded-lg bg-white/[0.05] text-body text-white border border-white/[0.1] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all duration-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
          : 'border-white/[0.08] hover:border-accent/30',
      )}
    >
      <div
        className={clsx(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0',
          selected ? 'border-accent bg-accent' : 'border-white/20',
        )}
      >
        {selected && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={clsx('text-body font-medium', selected ? 'text-accent' : 'text-white')}>
            {label}
          </span>
          <span className={clsx(selected ? 'text-accent' : 'text-white/50')}>
            {icon}
          </span>
        </div>
        <p className="text-caption text-white/50">{description}</p>
      </div>
    </button>
  );
}
