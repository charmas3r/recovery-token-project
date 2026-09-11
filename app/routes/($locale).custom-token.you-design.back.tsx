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
import {BACK_PRESETS, getBackPresetById} from '~/lib/custom-token-presets';
import {resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'back')
  ) {
    return redirect('/custom-token/you-design/refine');
  }

  const idsToResolve: string[] = [];
  if (session.backMode === 'custom') {
    const backId = session.backSelectedPreviewId ?? session.backFinalDesignId;
    if (backId && backId !== 'pending') idsToResolve.push(backId);
  } else if (session.backPresetId) {
    const preset = getBackPresetById(session.backPresetId);
    if (preset) idsToResolve.push(preset.fileGid);
  }

  const [resolved, presetImageUrls] = await Promise.all([
    idsToResolve.length ? resolveShopifyFileIds(idsToResolve, context.env) : Promise.resolve({} as Record<string, string>),
    resolveShopifyFileIds(BACK_PRESETS.map((p) => p.fileGid), context.env),
  ]);

  return {
    backMode: session.backMode ?? null,
    backPresetId: session.backPresetId ?? null,
    backDesignPrompt: session.backDesignPrompt ?? '',
    backImageUrl: idsToResolve[0] ? resolved[idsToResolve[0]] ?? '' : '',
    backRefinementCount: session.backRefinementPrompts?.length ?? 0,
    generationCount: session.generationCount ?? 0,
    presets: BACK_PRESETS.map((p) => ({...p, imageUrl: presetImageUrls[p.fileGid] ?? ''})),
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'select-preset') {
    const presetId = formData.get('presetId') as string;
    const preset = getBackPresetById(presetId);
    if (!preset) return {error: 'Unknown preset selected'};

    updateCustomTokenSession(context.session as AppSession, {
      backMode: 'preset',
      backPresetId: preset.id,
      backFinalDesignId: preset.fileGid,
    });

    const resolved = await resolveShopifyFileIds([preset.fileGid], context.env);
    return Response.json(
      {backImageUrl: resolved[preset.fileGid] ?? '', backPresetId: preset.id},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
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
  const [mode, setMode] = useState<'preset' | 'custom'>(backMode === 'custom' ? 'custom' : 'preset');
  const [selectedPreset, setSelectedPreset] = useState(backPresetId ?? undefined);
  const [backImageUrl, setBackImageUrl] = useState(initialUrl);

  useEffect(() => {
    if (presetFetcher.data && 'backImageUrl' in presetFetcher.data) {
      setBackImageUrl(presetFetcher.data.backImageUrl);
      setSelectedPreset(presetFetcher.data.backPresetId);
    }
  }, [presetFetcher.data]);

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
          presets={presets}
          selected={selectedPreset}
          onChange={(presetId) => {
            const fd = new FormData();
            fd.set('intent', 'select-preset');
            fd.set('presetId', presetId);
            presetFetcher.submit(fd, {method: 'POST'});
          }}
        />
      )}

      {(actionData?.error || presetFetcher.data?.error) && (
        <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '1rem'}}>
          {actionData?.error || presetFetcher.data?.error}
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
