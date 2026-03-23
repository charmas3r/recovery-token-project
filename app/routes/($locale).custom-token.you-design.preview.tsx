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
import {DesignPreviewGrid} from '~/components/custom-token/DesignPreviewGrid';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {createImageProvider} from '~/lib/ai/adapter';
import {buildTokenPrompt} from '~/lib/ai/prompt-engine';
import {uploadImageToShopifyFiles} from '~/lib/shopify-uploads.server';
import {checkAndIncrementDailyLimit} from '~/lib/ai/rate-limit.server';
import type {AppSession} from '~/lib/session';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'preview')
  ) {
    return redirect('/custom-token/you-design/describe');
  }
  return {
    previewImageIds: session.previewImageIds ?? [],
    selectedPreviewId: session.selectedPreviewId,
    designPrompt: session.designPrompt,
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
    if ((session.generationCount ?? 0) + 4 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    const dailyCheck = await checkAndIncrementDailyLimit(context.env, 4);
    if (!dailyCheck.allowed) {
      return {
        error:
          'Design service temporarily unavailable. Please try again later.',
      };
    }

    // Generate 4 previews
    const provider = createImageProvider(context.env);
    const prompt = buildTokenPrompt(session.designPrompt!, {
      material: session.material,
    });

    let result;
    try {
      result = await provider.generate({prompt, count: 4, size: '1024x1024'});
    } catch (e: any) {
      return {error: `Generation failed: ${e.message}. Please try again.`};
    }

    // Upload all previews to Shopify Files
    const uploadResults = await Promise.all(
      result.images.map((img, i) =>
        uploadImageToShopifyFiles(
          {url: img.url, filename: `custom-token-preview-${i + 1}.png`},
          context.env,
        ),
      ),
    );

    const previewImageIds = uploadResults.map((r) => r.fileId);
    updateCustomTokenSession(context.session as AppSession, {
      previewImageIds,
      generationCount: (session.generationCount ?? 0) + 4,
    });

    return Response.json(
      {previewImageIds, previewUrls: uploadResults.map((r) => r.url)},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  if (intent === 'select') {
    const selectedPreviewId = formData.get('selectedPreviewId') as string;
    if (!selectedPreviewId) return {error: 'Please select a design'};

    updateCustomTokenSession(context.session as AppSession, {
      selectedPreviewId,
    });
    return redirect('/custom-token/you-design/refine', {
      headers: {'Set-Cookie': await context.session.commit()},
    });
  }

  return {error: 'Unknown action'};
}

export default function YouDesignPreview() {
  const {previewImageIds, selectedPreviewId, designPrompt} =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const generateFetcher = useFetcher();
  const [selected, setSelected] = useState(selectedPreviewId ?? '');
  const [images, setImages] = useState<Array<{url: string; id: string}>>([]);

  const isGenerating = generateFetcher.state !== 'idle';
  const hasImages = images.length > 0 || previewImageIds.length > 0;

  // Update images when generation completes
  useEffect(() => {
    if (generateFetcher.data?.previewUrls) {
      const newImages = generateFetcher.data.previewUrls.map(
        (url: string, i: number) => ({
          url,
          id: generateFetcher.data.previewImageIds[i],
        }),
      );
      setImages(newImages);
    }
  }, [generateFetcher.data]);

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
          Step 2 of 5
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
          {hasImages ? 'Choose your design' : 'Generate designs'}
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '0.5rem',
          }}
        >
          {hasImages
            ? 'Select the design you like best. You can refine it in the next step.'
            : `We'll generate 4 token designs based on: "${designPrompt}"`}
        </p>
      </div>

      {!hasImages && (
        <generateFetcher.Form method="post" style={{textAlign: 'center', padding: '2rem 0'}}>
          <input type="hidden" name="intent" value="generate" />
          <button
            type="submit"
            disabled={isGenerating}
            style={{
              borderRadius: '1rem',
              border: '1px solid #B8764F',
              background: 'rgba(184,118,79,0.1)',
              padding: '1.5rem 2rem',
              color: '#B8764F',
              fontWeight: 700,
              fontSize: '1.125rem',
              cursor: isGenerating ? 'default' : 'pointer',
              transition: 'background 0.2s',
              opacity: isGenerating ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!isGenerating) e.currentTarget.style.background = 'rgba(184,118,79,0.2)'; }}
            onMouseLeave={(e) => { if (!isGenerating) e.currentTarget.style.background = 'rgba(184,118,79,0.1)'; }}
          >
            {isGenerating
              ? 'Generating designs... (this may take 15-30 seconds)'
              : 'Generate 4 Token Designs'}
          </button>
        </generateFetcher.Form>
      )}

      {(hasImages || isGenerating) && (
        <DesignPreviewGrid
          images={images}
          selectedId={selected}
          onSelect={setSelected}
          loading={isGenerating}
        />
      )}

      {(actionData?.error || generateFetcher.data?.error) && (
        <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '1rem'}}>
          {actionData?.error || generateFetcher.data?.error}
        </p>
      )}

      {hasImages && (
        <Form method="post" style={{marginTop: '1.5rem'}}>
          <input type="hidden" name="intent" value="select" />
          <input type="hidden" name="selectedPreviewId" value={selected} />
          <WizardNav
            backTo="/custom-token/you-design/describe"
            nextLabel="Refine This Design"
            disabled={!selected}
          />
        </Form>
      )}
    </div>
  );
}
