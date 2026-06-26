import {
  Form,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.refine';
import {
  getCustomTokenSession,
  updateCustomTokenSession,
  canProceedToStep,
} from '~/lib/custom-token-session';
import {DesignRefiner} from '~/components/custom-token/DesignRefiner';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {createImageProvider} from '~/lib/ai/adapter';
import {buildRefinementPrompt} from '~/lib/ai/prompt-engine';
import {
  uploadImageToShopifyFiles,
  resolveShopifyFileIds,
} from '~/lib/shopify-uploads.server';
import {checkAndIncrementDailyLimit} from '~/lib/ai/rate-limit.server';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';

const MAX_REFINEMENTS = 3;

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'refine')
  ) {
    return redirect('/custom-token/you-design/preview');
  }
  // Resolve the current design (final or selected preview) to a URL for display
  const currentId = session.finalDesignId ?? session.selectedPreviewId;
  let currentDesignUrl = '';
  if (currentId) {
    const resolved = await resolveShopifyFileIds([currentId], context.env);
    currentDesignUrl = resolved[currentId] ?? '';
  }

  return {
    selectedPreviewId: session.selectedPreviewId,
    finalDesignId: session.finalDesignId,
    refinementPrompts: session.refinementPrompts ?? [],
    generationCount: session.generationCount ?? 0,
    currentDesignUrl,
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'refine') {
    const refinement = (formData.get('refinement') as string)?.trim();
    if (!refinement) return {error: 'Please describe what to change'};

    const session = getCustomTokenSession(context.session as AppSession)!;
    const refinements = session.refinementPrompts ?? [];

    if (refinements.length >= MAX_REFINEMENTS) {
      return {error: 'Maximum refinements reached'};
    }

    // Check rate limits
    const sessionLimit = parseInt(
      context.env.AI_MAX_GENERATIONS_PER_SESSION || '7',
      10,
    );
    if ((session.generationCount ?? 0) + 1 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    const dailyCheck = await checkAndIncrementDailyLimit(context.env, 1);
    if (!dailyCheck.allowed) {
      return {error: 'Design service temporarily unavailable.'};
    }

    const provider = createImageProvider(context.env);
    const prompt = buildRefinementPrompt(session.designPrompt!, refinement, session.material);

    let result;
    try {
      result = await provider.generate({prompt, count: 1, size: '1024x1024'});
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.startsWith('SAFETY_REJECTED:')) {
        return {error: msg.replace('SAFETY_REJECTED: ', ''), safetyRejected: true};
      }
      return {error: msg.replace('SYSTEM_ERROR: ', '')};
    }

    const img = result.images[0];
    const displayUrl = img.url; // data:image/png;base64,... for immediate display

    let fileId = '';
    try {
      const uploadResult = await uploadImageToShopifyFiles(
        img.b64Data
          ? {b64Data: img.b64Data, filename: `custom-token-refined-${refinements.length + 1}.png`}
          : {url: img.url, filename: `custom-token-refined-${refinements.length + 1}.png`},
        context.env,
      );
      fileId = uploadResult.fileId;
    } catch {
      // Upload failed — still show the preview
    }

    updateCustomTokenSession(context.session as AppSession, {
      finalDesignId: fileId || 'pending',
      refinementPrompts: [...refinements, refinement],
      generationCount: (session.generationCount ?? 0) + 1,
    });

    return Response.json(
      {newDesignUrl: displayUrl, newDesignId: fileId},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  if (intent === 'continue') {
    const session = getCustomTokenSession(context.session as AppSession)!;
    // If no refinements were made, use the selected preview as final
    if (!session.finalDesignId) {
      updateCustomTokenSession(context.session as AppSession, {
        finalDesignId: session.selectedPreviewId,
      });
    }
    return redirect('/custom-token/you-design/review', {
      headers: {'Set-Cookie': await context.session.commit()},
    });
  }

  return {error: 'Unknown action'};
}

export default function YouDesignRefine() {
  const {
    selectedPreviewId,
    finalDesignId,
    refinementPrompts,
    generationCount,
    currentDesignUrl: initialUrl,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const refineFetcher = useFetcher();
  const [currentDesignUrl, setCurrentDesignUrl] = useState(initialUrl);

  const isRefining = refineFetcher.state !== 'idle';

  useEffect(() => {
    if (refineFetcher.data?.newDesignUrl) {
      setCurrentDesignUrl(refineFetcher.data.newDesignUrl);
    }
  }, [refineFetcher.data]);

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span
          style={{
            display: 'inline-block',
            color: '#B8764F',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          Step 4 of 5
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
          }}
        >
          Refine your design
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '0.5rem',
          }}
        >
          Happy with this design? Continue to the next step. Want changes?
          Describe them below.
        </p>
      </div>

      <DesignRefiner
        currentDesignUrl={currentDesignUrl}
        refinementsUsed={refinementPrompts.length}
        maxRefinements={MAX_REFINEMENTS}
        refining={isRefining}
        onRefine={(prompt) => {
          const fd = new FormData();
          fd.set('intent', 'refine');
          fd.set('refinement', prompt);
          refineFetcher.submit(fd, {method: 'POST'});
        }}
      />

      {(actionData?.error || refineFetcher.data?.error) && (
        <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '1rem'}}>
          {actionData?.error || refineFetcher.data?.error}
        </p>
      )}

      <Form
        method="post"
        style={{marginTop: '1.5rem'}}
        onSubmit={() => trackEvent('custom_token_step', {path: 'you-design', step: 'refine'})}
      >
        <input type="hidden" name="intent" value="continue" />
        <WizardNav
          backTo="/custom-token/you-design/preview"
          nextLabel="Continue with This Design"
        />
      </Form>
    </div>
  );
}
