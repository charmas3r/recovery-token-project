import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.material';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {MaterialSelector} from '~/components/custom-token/MaterialSelector';
import type {AppSession} from '~/lib/session';

// GraphQL query for the custom token product variants
const CUSTOM_TOKEN_PRODUCT_QUERY = `#graphql
  query CustomTokenProduct($handle: String!) {
    product(handle: $handle) {
      id
      variants(first: 10) {
        nodes {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
        }
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'material')) {
    return redirect('/custom-token/we-design/description');
  }

  // Fetch product variants to display material options with prices
  const {product} = await context.storefront.query(CUSTOM_TOKEN_PRODUCT_QUERY, {
    variables: {handle: 'custom-token'},
  });

  const variants = product?.variants?.nodes ?? [];
  let materialOptions = variants
    .filter((v: any) => v.availableForSale && v.title.includes('We Design'))
    .map((v: any) => ({
      id: v.id,
      label: v.title.replace('We Design - ', ''),
      value: (v.title.toLowerCase().includes('brass') ? 'brass' : 'color') as 'brass' | 'color',
      price: `$${parseFloat(v.price.amount).toFixed(2)}`,
      description: v.title.toLowerCase().includes('brass')
        ? 'Classic polished brass with silver engraving'
        : 'Vibrant color enamel with detailed design',
    }));

  // Fallback: try without path filter if no matches (variant titles may differ)
  if (materialOptions.length === 0) {
    materialOptions = variants
      .filter((v: any) => v.availableForSale)
      .map((v: any) => ({
        id: v.id,
        label: v.title,
        value: (v.title.toLowerCase().includes('brass') ? 'brass' : 'color') as 'brass' | 'color',
        price: `$${parseFloat(v.price.amount).toFixed(2)}`,
        description: v.title.toLowerCase().includes('brass')
          ? 'Classic polished brass with silver engraving'
          : 'Vibrant color enamel with detailed design',
      }));
  }

  // Debug info for troubleshooting
  const debug = {
    productFound: !!product,
    totalVariants: variants.length,
    variantTitles: variants.map((v: any) => v.title),
  };

  return {materialOptions, selectedMaterial: session.material, debug};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const material = formData.get('material') as string;
  const variantId = formData.get('variantId') as string;

  if (!material || !variantId) {
    return {error: 'Please select a material'};
  }

  updateCustomTokenSession(context.session as AppSession, {
    material: material as 'brass' | 'color',
    variantId,
  });
  return redirect('/custom-token/we-design/engraving', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function WeDesignMaterial() {
  const {materialOptions, selectedMaterial, debug} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [selected, setSelected] = useState<{material: string; variantId: string} | null>(
    selectedMaterial ? {material: selectedMaterial, variantId: ''} : null,
  );

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 3 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Choose your material
        </h2>
      </div>

      <Form method="post">
        <input type="hidden" name="material" value={selected?.material ?? ''} />
        <input type="hidden" name="variantId" value={selected?.variantId ?? ''} />

        <MaterialSelector
          options={materialOptions}
          selected={selected?.material}
          onChange={(value, variantId) => setSelected({material: value, variantId})}
        />

        {actionData?.error && (
          <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '1rem'}}>{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/we-design/description" disabled={!selected} />
      </Form>

      {/* Temporary debug — remove after fixing */}
      <details style={{marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)'}}>
        <summary>Debug info</summary>
        <pre style={{marginTop: '0.5rem', whiteSpace: 'pre-wrap'}}>
          {JSON.stringify({debug, materialOptions: materialOptions.map((o: any) => ({id: o.id, label: o.label})), selected}, null, 2)}
        </pre>
      </details>
    </div>
  );
}
