import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'featuredToken',
  title: 'Featured Token',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrowText',
      title: 'Eyebrow Text',
      type: 'string',
      description: 'Small uppercase label above the title (e.g. "Featured Token")',
      initialValue: 'Featured Token',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Main heading (e.g. "The Sunflower Token")',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Body text describing the featured token',
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'image',
      title: 'Token Image',
      type: 'image',
      description: 'Product image displayed in the center of the showcase',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imageAlt',
      title: 'Image Alt Text',
      type: 'string',
      description: 'Accessible alt text for the token image',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'productUrl',
      title: 'Product URL',
      type: 'url',
      description: 'Link to the Shopify product page',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      description: 'CTA button label (e.g. "View Token Details")',
      initialValue: 'View Token Details',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'leftFeatures',
      title: 'Left Feature Cards',
      type: 'array',
      of: [{type: 'featureCard'}],
      description: 'Feature cards displayed to the left of the token image',
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'rightFeatures',
      title: 'Right Feature Cards',
      type: 'array',
      of: [{type: 'featureCard'}],
      description: 'Feature cards displayed to the right of the token image',
      validation: (Rule) => Rule.max(3),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({title, media}) {
      return {
        title: title || 'Featured Token',
        subtitle: 'Homepage showcase',
        media,
      };
    },
  },
});
