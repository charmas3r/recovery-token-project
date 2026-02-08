import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'productCTABlock',
  title: 'Product CTA',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buttonHref',
      title: 'Button Link',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}: {title?: string}) {
      return {
        title: title || 'Untitled CTA',
        subtitle: 'Product CTA',
      };
    },
  },
});
