/**
 * RecoveryCircleMemberCard Component
 *
 * Displays a recovery circle member with their sobriety stats
 * @see app/lib/recoveryCircle.ts
 */

import {Form} from 'react-router';
import {useState} from 'react';
import {Button} from '~/components/ui/Button';
import {
  calculateDaysSober,
  getNextMilestone,
  getRelationshipLabel,
  type RecoveryCircleMember,
} from '~/lib/recoveryCircle';
import {AddMemberForm} from './AddMemberForm';
import {Users, Calendar, Award, Pencil, Trash2} from 'lucide-react';

interface RecoveryCircleMemberCardProps {
  member: RecoveryCircleMember;
  giftCount?: number;
}

export function RecoveryCircleMemberCard({
  member,
  giftCount,
}: RecoveryCircleMemberCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const daysSober = calculateDaysSober(member.cleanDate);
  const nextMilestone = getNextMilestone(member.cleanDate);

  const cleanDateFormatted = new Date(member.cleanDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (isEditing) {
    return (
      <AddMemberForm
        isOpen
        onClose={() => setIsEditing(false)}
        defaultValues={member}
        formAction="edit"
        memberId={member.id}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-black/5 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-bold text-lg">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-primary">
              {member.name}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-caption text-secondary">
              <Users className="w-3.5 h-3.5" />
              {getRelationshipLabel(member.relationship)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg text-secondary hover:text-accent hover:bg-accent/5 transition-colors"
            aria-label={`Edit ${member.name}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg text-secondary hover:text-error hover:bg-error/5 transition-colors"
            aria-label={`Remove ${member.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface rounded-lg p-3 text-center">
          <div className="font-display text-xl font-bold text-accent">
            {daysSober.toLocaleString()}
          </div>
          <div className="text-caption text-secondary">Days Sober</div>
        </div>
        {nextMilestone && (
          <div className="bg-surface rounded-lg p-3 text-center">
            <div className="font-display text-xl font-bold text-primary">
              {nextMilestone.daysUntil}d
            </div>
            <div className="text-caption text-secondary">
              to {nextMilestone.label}
            </div>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 text-caption text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {cleanDateFormatted}
        </span>
        {member.recoveryProgram && (
          <span className="inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            {member.recoveryProgram}
          </span>
        )}
        {typeof giftCount === 'number' && giftCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-accent font-medium">
            {giftCount} {giftCount === 1 ? 'gift' : 'gifts'} sent
          </span>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-4 pt-4 border-t border-black/5">
          <p className="text-body-sm text-secondary mb-3">
            Remove <strong>{member.name}</strong> from your circle? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Form method="POST">
              <input type="hidden" name="formAction" value="delete" />
              <input type="hidden" name="memberId" value={member.id} />
              <Button type="submit" variant="destructive" size="sm">
                Remove
              </Button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
