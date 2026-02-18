/**
 * AddMemberForm Component
 *
 * Form for adding or editing recovery circle members
 * @see app/lib/recoveryCircle.ts
 */

import {Form, useNavigation} from 'react-router';
import {Button} from '~/components/ui/Button';
import {Input} from '~/components/ui/Input';
import {
  RELATIONSHIP_OPTIONS,
  RECOVERY_PROGRAM_OPTIONS,
  type RecoveryCircleMember,
} from '~/lib/recoveryCircle';
import {X} from 'lucide-react';

interface AddMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: RecoveryCircleMember;
  formAction: 'add' | 'edit';
  memberId?: string;
}

export function AddMemberForm({
  isOpen,
  onClose,
  defaultValues,
  formAction,
  memberId,
}: AddMemberFormProps) {
  const {state} = useNavigation();
  const isSubmitting = state !== 'idle';

  if (!isOpen) return null;

  return (
    <div className="rounded-xl border border-accent/20 p-6 mb-6" style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold text-white">
          {formAction === 'edit' ? 'Edit Member' : 'Add to Your Circle'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Form method="POST">
        <input type="hidden" name="formAction" value={formAction} />
        {memberId && <input type="hidden" name="memberId" value={memberId} />}

        <div className="space-y-4">
          <div>
            <label htmlFor="memberName" className="block text-body-sm font-medium text-white mb-2">
              Name *
            </label>
            <Input
              id="memberName"
              name="name"
              type="text"
              placeholder="Enter their name"
              defaultValue={defaultValues?.name ?? ''}
              required
              minLength={2}
            />
          </div>

          <div>
            <label htmlFor="cleanDate" className="block text-body-sm font-medium text-white mb-2">
              Clean Date *
            </label>
            <Input
              id="cleanDate"
              name="cleanDate"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              defaultValue={defaultValues?.cleanDate ?? ''}
              required
            />
          </div>

          <div>
            <label htmlFor="relationship" className="block text-body-sm font-medium text-white mb-2">
              Relationship *
            </label>
            <select
              id="relationship"
              name="relationship"
              className="w-full h-12 px-4 rounded-lg bg-white/[0.05] text-body text-white focus:outline-none focus:bg-white/[0.08] focus:ring-2 focus:ring-accent/20 transition-all duration-200"
              defaultValue={defaultValues?.relationship ?? ''}
              required
            >
              <option value="">Select relationship</option>
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="recoveryProgram" className="block text-body-sm font-medium text-white mb-2">
              Recovery Program
            </label>
            <select
              id="recoveryProgram"
              name="recoveryProgram"
              className="w-full h-12 px-4 rounded-lg bg-white/[0.05] text-body text-white focus:outline-none focus:bg-white/[0.08] focus:ring-2 focus:ring-accent/20 transition-all duration-200"
              defaultValue={defaultValues?.recoveryProgram ?? ''}
            >
              <option value="">Select program (optional)</option>
              {RECOVERY_PROGRAM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-5 border-t border-white/[0.08]">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : formAction === 'edit'
                ? 'Save Changes'
                : 'Add Member'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
