import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'calloutBlock',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          {title: 'Info', value: 'info'},
          {title: 'Tip', value: 'tip'},
        ],
      },
      initialValue: 'info',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', variant: 'variant'},
    prepare({title, variant}: {title?: string; variant?: string}) {
      return {
        title: title || 'Untitled callout',
        subtitle: variant === 'tip' ? 'Tip' : 'Info',
      };
    },
  },
});
