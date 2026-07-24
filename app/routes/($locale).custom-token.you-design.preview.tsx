import {
  Form,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.preview';
import {
  getCustomTokenSession,
  updateCustomTokenSession,
  canProceedToStep,
} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {createImageProvider} from '~/lib/ai/adapter';
import {buildTokenPrompt} from '~/lib/ai/prompt-engine';
import {uploadImageToShopifyFiles, resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import {checkAndIncrementDailyLimit} from '~/lib/ai/rate-limit.server';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'preview')
  ) {
    return redirect('/custom-token/you-design/material');
  }

  // If we already have a preview, resolve its URL
  let previewUrl = '';
  const previewId = session.selectedPreviewId ?? session.previewImageIds?.[0];
  if (previewId) {
    const resolved = await resolveShopifyFileIds([previewId], context.env);
    previewUrl = resolved[previewId] ?? '';
  }

  return {
    previewId: previewId ?? null,
    previewUrl,
    designPrompt: session.designPrompt,
    generationCount: session.generationCount ?? 0,
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'generate') {
    const session = getCustomTokenSession(context.session as AppSession)!;

    // Check rate limits
    const sessionLimit = parseInt(
      context.env.AI_MAX_GENERATIONS_PER_SESSION || '7',
      10,
    );
    if ((session.generationCount ?? 0) + 1 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    try {
      const dailyCheck = await checkAndIncrementDailyLimit(context.env, 1);
      if (!dailyCheck.allowed) {
        return {
          error:
            'Design service temporarily unavailable. Please try again later.',
        };
      }
    } catch (e) {
      console.error('Daily limit check failed:', e);
      return {
        error:
          'Design service temporarily unavailable. Please try again later.',
      };
    }

    // Generate 1 preview
    let result;
    try {
      const provider = createImageProvider(context.env);
      const prompt = buildTokenPrompt(session.designPrompt!, {
        material: session.material,
      });
      result = await provider.generate({prompt, count: 1, size: '1024x1024'});
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.startsWith('SAFETY_REJECTED:')) {
        return {error: msg.replace('SAFETY_REJECTED: ', ''), safetyRejected: true};
      }
      if (msg.startsWith('SYSTEM_ERROR:')) {
        return {error: msg.replace('SYSTEM_ERROR: ', '')};
      }
      // Config/infrastructure errors (e.g. missing OPENAI_API_KEY) — don't 500
      console.error('Custom token generation failed:', e);
      return {
        error:
          'Image generation is temporarily unavailable. Please try again later.',
      };
    }

    // Get the displayable URL (base64 data URL for immediate display)
    const img = result.images[0];
    const displayUrl = img.url; // data:image/png;base64,... or remote URL

    // Upload to Shopify Files in background for storage
    // (Shopify fileCreate is async — CDN URL won't be ready immediately)
    let fileId = '';
    try {
      const uploadResult = await uploadImageToShopifyFiles(
        img.b64Data
          ? {b64Data: img.b64Data, filename: `custom-token-preview.png`}
          : {url: img.url, filename: `custom-token-preview.png`},
        context.env,
      );
      fileId = uploadResult.fileId;
    } catch {
      // Upload failed — we can still show the preview, just won't persist to Shopify Files
    }

    updateCustomTokenSession(context.session as AppSession, {
      previewImageIds: fileId ? [fileId] : [],
      selectedPreviewId: fileId || 'pending',
      generationCount: (session.generationCount ?? 0) + 1,
    });

    return Response.json(
      {previewUrl: displayUrl, previewId: fileId},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  if (intent === 'continue') {
    return redirect('/custom-token/you-design/refine', {
      headers: {'Set-Cookie': await context.session.commit()},
    });
  }

  return {error: 'Unknown action'};
}

export default function YouDesignPreview() {
  const {previewId, previewUrl: initialUrl, designPrompt, generationCount} =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const generateFetcher = useFetcher();
  const [previewUrl, setPreviewUrl] = useState(initialUrl);

  const isGenerating = generateFetcher.state !== 'idle';
  const hasPreview = !!previewUrl;

  // Update preview when generation completes
  useEffect(() => {
    if (generateFetcher.data?.previewUrl) {
      setPreviewUrl(generateFetcher.data.previewUrl);
    }
  }, [generateFetcher.data]);

  const sessionLimit = 7;
  const canRegenerate = generationCount < sessionLimit && !isGenerating;

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
          Step 3 of 5
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
          {hasPreview ? 'Your token design' : 'Generate your design'}
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '0.5rem',
          }}
        >
          {hasPreview
            ? 'Happy with this? Continue to refine it, or regenerate for a new design.'
            : `We'll generate a token design based on: "${designPrompt}"`}
        </p>
      </div>

      {/* Generate button (no preview yet) */}
      {!hasPreview && !isGenerating && (
        <generateFetcher.Form method="post" style={{textAlign: 'center', padding: '2rem 0'}}>
          <input type="hidden" name="intent" value="generate" />
          <button
            type="submit"
            style={{
              borderRadius: '1rem',
              border: '1px solid #B8764F',
              background: 'rgba(184,118,79,0.1)',
              padding: '1.5rem 2rem',
              color: '#B8764F',
              fontWeight: 700,
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,118,79,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(184,118,79,0.1)'; }}
          >
            Generate Token Design
          </button>
        </generateFetcher.Form>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div style={{textAlign: 'center', padding: '3rem 0'}}>
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem'}}>Generating...</span>
          </div>
          <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem'}}>
            This may take 15-30 seconds
          </p>
        </div>
      )}

      {/* Preview image */}
      {hasPreview && !isGenerating && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'}}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            aspectRatio: '1',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '2px solid rgba(184,118,79,0.3)',
          }}>
            <img
              src={previewUrl}
              alt="Generated token design"
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </div>

          {/* Regenerate button */}
          {canRegenerate && (
            <generateFetcher.Form method="post">
              <input type="hidden" name="intent" value="generate" />
              <button
                type="submit"
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                Regenerate design
              </button>
            </generateFetcher.Form>
          )}
        </div>
      )}

      {/* Errors */}
      {(actionData?.error || generateFetcher.data?.error) && (
        <div style={{marginTop: '1.5rem', padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)'}}>
          <p style={{color: '#f87171', fontSize: '0.875rem', lineHeight: 1.6}}>
            {actionData?.error || generateFetcher.data?.error}
          </p>
          {(actionData?.safetyRejected || generateFetcher.data?.safetyRejected) && (
            <a
              href="/custom-token/you-design/describe"
              style={{display: 'inline-block', marginTop: '0.75rem', color: '#B8764F', fontSize: '0.875rem', textDecoration: 'underline'}}
            >
              Go back and edit your description
            </a>
          )}
        </div>
      )}

      {/* Continue to refine */}
      {hasPreview && !isGenerating && (
        <Form
          method="post"
          style={{marginTop: '1.5rem'}}
          onSubmit={() => trackEvent('custom_token_step', {path: 'you-design', step: 'preview'})}
        >
          <input type="hidden" name="intent" value="continue" />
          <WizardNav
            backTo="/custom-token/you-design/material"
            nextLabel="Continue to Refine"
          />
        </Form>
      )}
    </div>
  );
}
