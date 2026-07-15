import {Form, redirect, useActionData, useFetcher, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.description';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {ImageUploader} from '~/components/custom-token/ImageUploader';
import {uploadImageToShopifyFiles, resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'description')) {
    return redirect('/custom-token/we-design/occasion');
  }
  // Resolve image IDs to URLs for display. Prefer the URL captured at
  // upload time — Shopify's fileCreate processes MediaImage assets
  // asynchronously, so querying the Admin API for a just-uploaded file's
  // image.url can race the processing and return null.
  const imageIds = session.inspirationImageIds ?? [];
  const knownUrls = session.inspirationImageUrls ?? {};
  const unknownIds = imageIds.filter((id) => !knownUrls[id]);
  const resolvedUrls = unknownIds.length
    ? await resolveShopifyFileIds(unknownIds, context.env)
    : {};
  const inspirationImageUrls = imageIds
    .map((id) => knownUrls[id] ?? resolvedUrls[id])
    .filter(Boolean);

  return {
    description: session.description ?? '',
    inspirationImageIds: session.inspirationImageIds ?? [],
    inspirationImageUrls,
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'upload') {
    // Handle image upload
    const files = formData.getAll('files') as File[];
    const results = await Promise.all(
      files.map((f) => uploadImageToShopifyFiles(f, context.env)),
    );
    const session = getCustomTokenSession(context.session as AppSession)!;
    const existingIds = session.inspirationImageIds ?? [];
    const existingUrls = session.inspirationImageUrls ?? {};
    const newIds = results.map((r) => r.fileId);
    const newUrls = Object.fromEntries(results.map((r) => [r.fileId, r.url]));
    updateCustomTokenSession(context.session as AppSession, {
      inspirationImageIds: [...existingIds, ...newIds],
      inspirationImageUrls: {...existingUrls, ...newUrls},
    });
    return Response.json(
      {uploadedIds: newIds},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  // Handle form submission (continue to next step)
  const description = formData.get('description') as string;
  if (!description || description.length < 10) {
    return {error: 'Please provide at least 10 characters describing your design'};
  }
  if (description.length > 500) {
    return {error: 'Description must be under 500 characters'};
  }

  updateCustomTokenSession(context.session as AppSession, {description});
  return redirect('/custom-token/we-design/material', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

const inputStyle: React.CSSProperties = {
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
};

export default function WeDesignDescription() {
  const {description, inspirationImageUrls} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const uploadFetcher = useFetcher();
  const [text, setText] = useState(description);
  const uploading = uploadFetcher.state !== 'idle';

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 2 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Describe your design
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Tell us what you envision. Upload any inspiration images to help us understand your style.
        </p>
      </div>

      <Form
        method="post"
        style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}
        onSubmit={() => trackEvent('custom_token_step', {path: 'we-design', step: 'description'})}
      >
        <div>
          <label htmlFor="description" style={{display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem'}}>
            Design Description
          </label>
          <textarea
            id="description"
            name="description"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you'd like on your token — symbols, text, themes, style..."
            maxLength={500}
            rows={5}
            style={inputStyle}
          />
          <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem'}}>{text.length}/500</span>
        </div>

        <div>
          <label style={{display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem'}}>
            Inspiration Images (optional)
          </label>
          <ImageUploader
            maxFiles={5}
            existingImages={inspirationImageUrls}
            uploading={uploading}
            onUpload={(files) => {
              const fd = new FormData();
              fd.set('intent', 'upload');
              files.forEach((f) => fd.append('files', f));
              uploadFetcher.submit(fd, {method: 'POST', encType: 'multipart/form-data'});
            }}
          />
        </div>

        {actionData?.error && (
          <p style={{color: '#f87171', fontSize: '0.875rem'}}>{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/we-design/occasion" />
      </Form>
    </div>
  );
}
