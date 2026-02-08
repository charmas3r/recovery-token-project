import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'quoteBlock',
  title: 'Quote',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Quote Text',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'text', subtitle: 'attribution'},
    prepare({title, subtitle}: {title?: string; subtitle?: string}) {
      return {
        title: title ? `"${title.slice(0, 60)}..."` : 'Empty quote',
        subtitle: subtitle || 'No attribution',
      };
    },
  },
});
