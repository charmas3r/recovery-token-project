import {
  Form,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.back';
import {
  getCustomTokenSession,
  updateCustomTokenSession,
  canProceedToStep,
} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {BackPresetSelector} from '~/components/custom-token/BackPresetSelector';
import {BACK_PRESETS, getBackPresetById, getDefaultBackPreset} from '~/lib/custom-token-presets';
import {
  uploadImageToShopifyFiles,
  resolveShopifyFileIds,
} from '~/lib/shopify-uploads.server';
import {createImageProvider} from '~/lib/ai/adapter';
import {buildTokenPrompt, buildRefinementPrompt} from '~/lib/ai/prompt-engine';
import {checkAndIncrementDailyLimit} from '~/lib/ai/rate-limit.server';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';
import {DesignRefiner} from '~/components/custom-token/DesignRefiner';

const MAX_REFINEMENTS = 3;

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'back')
  ) {
    return redirect('/custom-token/you-design/refine');
  }

  let backImageUrl = '';
  if (session.backMode === 'custom') {
    const backId = [session.backFinalDesignId, session.backSelectedPreviewId].find(
      (id) => id && id !== 'pending',
    );
    if (backId) {
      const resolved = await resolveShopifyFileIds([backId], context.env);
      backImageUrl = resolved[backId] ?? '';
    }
  } else if (session.backPresetId) {
    backImageUrl = getBackPresetById(session.backPresetId)?.imageUrl ?? '';
  }

  return {
    backMode: session.backMode ?? null,
    backPresetId: session.backPresetId ?? null,
    backDesignPrompt: session.backDesignPrompt ?? '',
    backImageUrl,
    backRefinementCount: session.backRefinementPrompts?.length ?? 0,
    generationCount: session.generationCount ?? 0,
    presets: BACK_PRESETS,
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'select-preset') {
    const presetId = formData.get('presetId') as string;
    const preset = getBackPresetById(presetId);
    if (!preset) return {error: 'Unknown preset selected'};

    const backImageUrl = `${new URL(request.url).origin}${preset.imageUrl}`;

    updateCustomTokenSession(context.session as AppSession, {
      backMode: 'preset',
      backPresetId: preset.id,
      backFinalDesignId: backImageUrl,
    });

    return Response.json(
      {backImageUrl, backPresetId: preset.id},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  if (intent === 'generate') {
    const backDesignPrompt = (formData.get('backDesignPrompt') as string)?.trim();
    if (!backDesignPrompt) return {error: 'Please describe your back design'};

    const session = getCustomTokenSession(context.session as AppSession)!;

    const sessionLimit = parseInt(context.env.AI_MAX_GENERATIONS_PER_SESSION || '7', 10);
    if ((session.generationCount ?? 0) + 1 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    try {
      const dailyCheck = await checkAndIncrementDailyLimit(context.env, 1);
      if (!dailyCheck.allowed) {
        return {error: 'Design service temporarily unavailable. Please try again later.'};
      }
    } catch (e) {
      console.error('Custom token back generation daily limit check failed:', e);
      return {error: 'Design service temporarily unavailable. Please try again later.'};
    }

    let result;
    try {
      const provider = createImageProvider(context.env);
      const prompt = buildTokenPrompt(backDesignPrompt, {material: session.material});
      result = await provider.generate({prompt, count: 1, size: '1024x1024'});
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.startsWith('SAFETY_REJECTED:')) {
        return {error: msg.replace('SAFETY_REJECTED: ', ''), safetyRejected: true};
      }
      if (msg.startsWith('SYSTEM_ERROR:')) {
        return {error: msg.replace('SYSTEM_ERROR: ', '')};
      }
      console.error('Custom token back generation failed:', e);
      return {error: 'Image generation is temporarily unavailable. Please try again later.'};
    }

    const img = result.images[0];
    const displayUrl = img.url;

    let fileId = '';
    try {
      const uploadResult = await uploadImageToShopifyFiles(
        img.b64Data
          ? {b64Data: img.b64Data, filename: 'custom-token-back-preview.png'}
          : {url: img.url, filename: 'custom-token-back-preview.png'},
        context.env,
      );
      fileId = uploadResult.fileId;
    } catch {
      // Upload failed — we can still show the preview
    }

    updateCustomTokenSession(context.session as AppSession, {
      backMode: 'custom',
      backDesignPrompt,
      backPreviewImageIds: fileId ? [fileId] : [],
      backSelectedPreviewId: fileId || 'pending',
      backFinalDesignId: fileId || 'pending',
      generationCount: (session.generationCount ?? 0) + 1,
    });

    return Response.json(
      {backImageUrl: displayUrl, backImageId: fileId},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  if (intent === 'refine') {
    const refinement = (formData.get('refinement') as string)?.trim();
    if (!refinement) return {error: 'Please describe what to change'};

    const session = getCustomTokenSession(context.session as AppSession)!;
    const refinements = session.backRefinementPrompts ?? [];

    if (refinements.length >= MAX_REFINEMENTS) {
      return {error: 'Maximum refinements reached'};
    }

    const sessionLimit = parseInt(context.env.AI_MAX_GENERATIONS_PER_SESSION || '7', 10);
    if ((session.generationCount ?? 0) + 1 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    const dailyCheck = await checkAndIncrementDailyLimit(context.env, 1);
    if (!dailyCheck.allowed) {
      return {error: 'Design service temporarily unavailable.'};
    }

    const provider = createImageProvider(context.env);
    const prompt = buildRefinementPrompt(session.backDesignPrompt!, refinement, session.material);

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
    const displayUrl = img.url;

    let fileId = '';
    try {
      const uploadResult = await uploadImageToShopifyFiles(
        img.b64Data
          ? {b64Data: img.b64Data, filename: `custom-token-back-refined-${refinements.length + 1}.png`}
          : {url: img.url, filename: `custom-token-back-refined-${refinements.length + 1}.png`},
        context.env,
      );
      fileId = uploadResult.fileId;
    } catch {
      // Upload failed — still show the preview
    }

    updateCustomTokenSession(context.session as AppSession, {
      backFinalDesignId: fileId || 'pending',
      backRefinementPrompts: [...refinements, refinement],
      generationCount: (session.generationCount ?? 0) + 1,
    });

    return Response.json(
      {backImageUrl: displayUrl, backImageId: fileId},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  if (intent === 'continue') {
    const session = getCustomTokenSession(context.session as AppSession)!;

    if (!session.backFinalDesignId || session.backFinalDesignId === 'pending') {
      if (session.backMode === 'custom' && session.backSelectedPreviewId && session.backSelectedPreviewId !== 'pending') {
        updateCustomTokenSession(context.session as AppSession, {
          backFinalDesignId: session.backSelectedPreviewId,
        });
      } else {
        const defaultPreset = getDefaultBackPreset();
        updateCustomTokenSession(context.session as AppSession, {
          backMode: 'preset',
          backPresetId: defaultPreset.id,
          backFinalDesignId: `${new URL(request.url).origin}${defaultPreset.imageUrl}`,
        });
      }
    }

    return redirect('/custom-token/you-design/review', {
      headers: {'Set-Cookie': await context.session.commit()},
    });
  }

  return {error: 'Unknown action'};
}

export default function YouDesignBack() {
  const {
    backMode,
    backPresetId,
    backDesignPrompt,
    backImageUrl: initialUrl,
    backRefinementCount,
    generationCount,
    presets,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const presetFetcher = useFetcher<typeof action>();
  const generateFetcher = useFetcher<typeof action>();
  const refineFetcher = useFetcher<typeof action>();
  const [mode, setMode] = useState<'preset' | 'custom'>(backMode === 'custom' ? 'custom' : 'preset');
  const [selectedPreset, setSelectedPreset] = useState(backPresetId ?? undefined);
  const [backImageUrl, setBackImageUrl] = useState(initialUrl);

  useEffect(() => {
    if (presetFetcher.data && 'backImageUrl' in presetFetcher.data) {
      setBackImageUrl(presetFetcher.data.backImageUrl);
      setSelectedPreset(presetFetcher.data.backPresetId);
    }
  }, [presetFetcher.data]);

  useEffect(() => {
    if (generateFetcher.data && 'backImageUrl' in generateFetcher.data) {
      setBackImageUrl(generateFetcher.data.backImageUrl);
    }
  }, [generateFetcher.data]);

  useEffect(() => {
    if (refineFetcher.data && 'backImageUrl' in refineFetcher.data) {
      setBackImageUrl(refineFetcher.data.backImageUrl);
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
          Step 5 of 6
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
          Design the back
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Choose a standard back design, or customize your own.
        </p>
      </div>

      {mode === 'preset' && (
        <BackPresetSelector
          options={[
            ...presets.map((preset) => ({
              id: preset.id,
              label: preset.label,
              imageUrl: preset.imageUrl,
              accentColor: preset.accentColor,
            })),
            {
              id: 'custom',
              label: 'AI Custom Design',
              isCustom: true,
              description: 'Describe it, AI creates it',
            },
          ]}
          selected={selectedPreset}
          onChange={(id) => {
            if (id === 'custom') {
              setMode('custom');
              return;
            }
            const fd = new FormData();
            fd.set('intent', 'select-preset');
            fd.set('presetId', id);
            presetFetcher.submit(fd, {method: 'POST'});
          }}
        />
      )}

      {mode === 'custom' && !backImageUrl && generateFetcher.state === 'idle' && (
        <generateFetcher.Form method="post">
          <input type="hidden" name="intent" value="generate" />
          <label
            htmlFor="backDesignPrompt"
            style={{display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem'}}
          >
            Describe the back design
          </label>
          <textarea
            id="backDesignPrompt"
            name="backDesignPrompt"
            defaultValue={backDesignPrompt}
            maxLength={500}
            rows={4}
            style={{
              width: '100%',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              padding: '0.5rem 1rem',
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem'}}>
            <button
              type="button"
              onClick={() => setMode('preset')}
              style={{background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', textDecoration: 'underline', cursor: 'pointer'}}
            >
              ← Back to presets
            </button>
            <button
              type="submit"
              disabled={generationCount >= 7}
              style={{
                borderRadius: '0.75rem',
                border: '1px solid #B8764F',
                background: 'rgba(184,118,79,0.1)',
                padding: '0.75rem 1.5rem',
                color: '#B8764F',
                fontWeight: 700,
                cursor: generationCount >= 7 ? 'not-allowed' : 'pointer',
                opacity: generationCount >= 7 ? 0.4 : 1,
              }}
            >
              Generate Back Design
            </button>
          </div>
        </generateFetcher.Form>
      )}

      {mode === 'custom' && generateFetcher.state !== 'idle' && (
        <div style={{textAlign: 'center', padding: '3rem 0'}}>
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem'}}>Generating...</span>
          </div>
          <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem'}}>This may take 15-30 seconds</p>
        </div>
      )}

      {mode === 'custom' && backImageUrl && generateFetcher.state === 'idle' && (
        <DesignRefiner
          currentDesignUrl={backImageUrl}
          refinementsUsed={backRefinementCount}
          maxRefinements={MAX_REFINEMENTS}
          refining={refineFetcher.state !== 'idle'}
          onRefine={(prompt) => {
            const fd = new FormData();
            fd.set('intent', 'refine');
            fd.set('refinement', prompt);
            refineFetcher.submit(fd, {method: 'POST'});
          }}
        />
      )}

      {(actionData?.error || presetFetcher.data?.error || generateFetcher.data?.error || refineFetcher.data?.error) && (
        <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '1rem'}}>
          {actionData?.error || presetFetcher.data?.error || generateFetcher.data?.error || refineFetcher.data?.error}
        </p>
      )}

      <Form
        method="post"
        style={{marginTop: '1.5rem'}}
        onSubmit={() => trackEvent('custom_token_step', {path: 'you-design', step: 'back'})}
      >
        <input type="hidden" name="intent" value="continue" />
        <WizardNav backTo="/custom-token/you-design/refine" nextLabel="Continue to Review" />
      </Form>
    </div>
  );
}
