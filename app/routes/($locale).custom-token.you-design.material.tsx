import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.material';
import {
  getCustomTokenSession,
  updateCustomTokenSession,
  canProceedToStep,
} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {MaterialSelector} from '~/components/custom-token/MaterialSelector';
import type {AppSession} from '~/lib/session';

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
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'material')
  ) {
    return redirect('/custom-token/you-design/refine');
  }

  const {product} = await context.storefront.query(
    CUSTOM_TOKEN_PRODUCT_QUERY,
    {
      variables: {handle: 'custom-token'},
    },
  );

  const variants = product?.variants?.nodes ?? [];
  let materialOptions = variants
    .filter((v: any) => v.availableForSale)
    .map((v: any) => ({
      id: v.id,
      label: v.title.includes('You Design')
        ? v.title.replace('You Design - ', '')
        : v.title,
      value: (v.title.toLowerCase().includes('brass')
        ? 'brass'
        : 'color') as 'brass' | 'color',
      price: `$${parseFloat(v.price.amount).toFixed(2)}`,
      description: v.title.toLowerCase().includes('brass')
        ? 'Classic polished brass with silver engraving'
        : 'Vibrant color enamel with detailed design',
    }));

  // Fallback options if product not yet created in Shopify
  if (materialOptions.length === 0) {
    materialOptions = [
      {
        id: 'placeholder-brass',
        label: 'Brass',
        value: 'brass' as const,
        price: '$49.99',
        description: 'Classic polished brass with silver engraving',
      },
      {
        id: 'placeholder-color',
        label: 'Color',
        value: 'color' as const,
        price: '$59.99',
        description: 'Vibrant color enamel with detailed design',
      },
    ];
  }

  return {materialOptions, selectedMaterial: session.material};
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
  return redirect('/custom-token/you-design/review', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function YouDesignMaterial() {
  const {materialOptions, selectedMaterial} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [selected, setSelected] = useState<{
    material: string;
    variantId: string;
  } | null>(selectedMaterial ? {material: selectedMaterial, variantId: ''} : null);

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
          Choose your material
        </h2>
      </div>

      <Form method="post">
        <input type="hidden" name="material" value={selected?.material ?? ''} />
        <input
          type="hidden"
          name="variantId"
          value={selected?.variantId ?? ''}
        />

        <MaterialSelector
          options={materialOptions}
          selected={selected?.material}
          onChange={(value, variantId) => setSelected({material: value, variantId})}
        />

        {actionData?.error && (
          <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '1rem'}}>{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/you-design/refine" />
      </Form>
    </div>
  );
}
