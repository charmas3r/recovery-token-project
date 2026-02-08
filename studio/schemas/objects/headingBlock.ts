import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'headingBlock',
  title: 'Heading',
  type: 'object',
  fields: [
    defineField({
      name: 'level',
      title: 'Level',
      type: 'number',
      options: {
        list: [
          {title: 'H2', value: 2},
          {title: 'H3', value: 3},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'id',
      title: 'Anchor ID',
      type: 'slug',
      options: {
        source: 'text',
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'text', level: 'level'},
    prepare({title, level}: {title?: string; level?: number}) {
      return {
        title: title || 'Untitled heading',
        subtitle: `H${level || 2}`,
      };
    },
  },
});
