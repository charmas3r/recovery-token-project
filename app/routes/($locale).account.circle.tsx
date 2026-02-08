import {useState, useEffect} from 'react';
import {data, Link, useActionData, useLoaderData} from 'react-router';
import type {Route} from './+types/account.circle';
import {AccountLayout} from '~/components/account/AccountLayout';
import {RecoveryCircleMemberCard} from '~/components/account/RecoveryCircleMemberCard';
import {AddMemberForm} from '~/components/account/AddMemberForm';
import {Button} from '~/components/ui/Button';
import {CUSTOMER_METAFIELDS_QUERY} from '~/graphql/customer-account/CustomerMetafieldsQuery';
import {CUSTOMER_METAFIELDS_SET_MUTATION} from '~/graphql/customer-account/CustomerMetafieldsMutation';
import {
  parseRecoveryCircle,
  serializeRecoveryCircle,
  generateMemberId,
  recoveryCircleMemberSchema,
  type RecoveryCircle,
  type RecoveryCircleMember,
} from '~/lib/recoveryCircle';
import {Users, Plus, Heart, AlertCircle, CheckCircle, Gift} from 'lucide-react';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Recovery Circle'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  customerAccount.handleAuthStatus();

  try {
    const {data: metafieldsData} = await customerAccount.query(
      CUSTOMER_METAFIELDS_QUERY,
      {variables: {language: customerAccount.i18n.language}},
    );

    const metafields = metafieldsData?.customer?.metafields ?? [];
    const circleRaw = metafields?.find(
      (m: any) => m?.key === 'recovery_circle',
    )?.value ?? null;

    const circle = parseRecoveryCircle(circleRaw);
    return {circle};
  } catch (error) {
    console.error('Failed to fetch recovery circle:', error);
    return {circle: [] as RecoveryCircle};
  }
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;
  const form = await request.formData();
  const formAction = form.get('formAction')?.toString();

  try {
    // Read current circle
    const {data: metafieldsData} = await customerAccount.query(
      CUSTOMER_METAFIELDS_QUERY,
      {variables: {language: customerAccount.i18n.language}},
    );

    const customerId = metafieldsData?.customer?.id;
    if (!customerId) throw new Error('Could not determine customer ID');

    const metafields = metafieldsData?.customer?.metafields ?? [];
    const circleRaw = metafields?.find(
      (m: any) => m?.key === 'recovery_circle',
    )?.value ?? null;

    let circle = parseRecoveryCircle(circleRaw);

    if (formAction === 'add') {
      const name = form.get('name')?.toString() ?? '';
      const cleanDate = form.get('cleanDate')?.toString() ?? '';
      const relationship = form.get('relationship')?.toString() ?? '';
      const recoveryProgram = form.get('recoveryProgram')?.toString() || undefined;

      // Validate
      const result = recoveryCircleMemberSchema.safeParse({
        name,
        cleanDate,
        relationship,
        recoveryProgram,
      });

      if (!result.success) {
        const firstError = result.error.issues[0];
        return data(
          {error: firstError.message, success: false, message: null as string | null},
          {status: 400},
        );
      }

      const newMember: RecoveryCircleMember = {
        id: generateMemberId(),
        name,
        cleanDate,
        relationship,
        recoveryProgram,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      circle.push(newMember);
    } else if (formAction === 'edit') {
      const memberId = form.get('memberId')?.toString();
      const name = form.get('name')?.toString() ?? '';
      const cleanDate = form.get('cleanDate')?.toString() ?? '';
      const relationship = form.get('relationship')?.toString() ?? '';
      const recoveryProgram = form.get('recoveryProgram')?.toString() || undefined;

      // Validate
      const result = recoveryCircleMemberSchema.safeParse({
        name,
        cleanDate,
        relationship,
        recoveryProgram,
      });

      if (!result.success) {
        const firstError = result.error.issues[0];
        return data(
          {error: firstError.message, success: false, message: null as string | null},
          {status: 400},
        );
      }

      circle = circle.map((m) =>
        m.id === memberId
          ? {
              ...m,
              name,
              cleanDate,
              relationship,
              recoveryProgram,
              updatedAt: new Date().toISOString(),
            }
          : m,
      );
    } else if (formAction === 'delete') {
      const memberId = form.get('memberId')?.toString();
      circle = circle.filter((m) => m.id !== memberId);
    } else {
      return data({error: 'Invalid action', success: false, message: null as string | null}, {status: 400});
    }

    // Write updated circle back to metafield
    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_METAFIELDS_SET_MUTATION,
      {
        variables: {
          metafields: [
            {
              key: 'recovery_circle',
              namespace: 'custom',
              value: serializeRecoveryCircle(circle),
              type: 'json',
              ownerId: customerId,
            },
          ],
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length || mutationData?.metafieldsSet?.userErrors?.length) {
      throw new Error(
        mutationData?.metafieldsSet?.userErrors?.[0]?.message ||
          errors?.[0]?.message ||
          'Failed to update recovery circle',
      );
    }

    const actionMessage =
      formAction === 'add'
        ? 'Member added to your circle'
        : formAction === 'edit'
          ? 'Member updated successfully'
          : 'Member removed from your circle';

    return data({success: true, message: actionMessage, error: null as string | null});
  } catch (error: any) {
    return data(
      {success: false, message: null as string | null, error: error.message || 'Something went wrong'},
      {status: 400},
    );
  }
}

export default function RecoveryCirclePage() {
  const {circle} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showAddForm, setShowAddForm] = useState(false);

  // Close form on successful add
  useEffect(() => {
    if (actionData?.success) {
      setShowAddForm(false);
    }
  }, [actionData]);

  return (
    <AccountLayout
      heading="Recovery Circle"
      subheading="People you're supporting on their recovery journey"
    >
      {/* Success Message */}
      {actionData?.success && actionData?.message && (
        <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <p className="text-body text-success">{actionData.message}</p>
        </div>
      )}

      {/* Error Message */}
      {actionData?.error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-body text-error">{actionData.error}</p>
        </div>
      )}

      {/* Header Stats */}
      {circle.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-body text-secondary">
              <Users className="w-5 h-5 text-accent" />
              <span>
                <strong className="text-primary">{circle.length}</strong>{' '}
                {circle.length === 1 ? 'person' : 'people'} in your circle
              </span>
            </div>
            <Link
              to="/account/circle/gifts"
              className="inline-flex items-center gap-1.5 text-body-sm text-accent hover:text-accent/80 font-medium transition-colors"
            >
              <Gift className="w-4 h-4" />
              View Gift History
            </Link>
          </div>
          {!showAddForm && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>
      )}

      {/* Add Member Form */}
      <AddMemberForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        formAction="add"
      />

      {/* Member Cards Grid */}
      {circle.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {circle.map((member) => (
            <RecoveryCircleMemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        /* Empty State */
        !showAddForm && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-bold text-primary mb-3">
              Start Your Recovery Circle
            </h3>
            <p className="text-body-lg text-secondary max-w-md mx-auto mb-8">
              Add friends and family members you're supporting in their recovery
              journey. Track their milestones and easily send them tokens as
              gifts.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Member
            </Button>
          </div>
        )
      )}
    </AccountLayout>
  );
}
