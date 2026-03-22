import {Form, redirect, useActionData, useFetcher, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.description';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {ImageUploader} from '~/components/custom-token/ImageUploader';
import {uploadImageToShopifyFiles, resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import type {AppSession} from '~/lib/session';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'description')) {
    return redirect('/custom-token/we-design/occasion');
  }
  // Resolve image IDs to URLs for display
  const imageIds = session.inspirationImageIds ?? [];
  const resolvedUrls = imageIds.length
    ? await resolveShopifyFileIds(imageIds, context.env)
    : {};
  const inspirationImageUrls = imageIds.map((id) => resolvedUrls[id]).filter(Boolean);

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
    const newIds = results.map((r) => r.fileId);
    updateCustomTokenSession(context.session as AppSession, {
      inspirationImageIds: [...existingIds, ...newIds],
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

      <Form method="post" className="space-y-lg">
        <div>
          <label htmlFor="description" className="block text-white text-sm font-medium mb-sm">
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
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <span className="text-white/30 text-xs">{text.length}/500</span>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-sm">
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
          <p className="text-red-400 text-sm">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/we-design/occasion" />
      </Form>
    </div>
  );
}
