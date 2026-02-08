import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'listBlock',
  title: 'List',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'List Style',
      type: 'string',
      options: {
        list: [
          {title: 'Ordered', value: 'ordered'},
          {title: 'Unordered', value: 'unordered'},
        ],
      },
      initialValue: 'unordered',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {style: 'style', items: 'items'},
    prepare({style, items}: {style?: string; items?: string[]}) {
      return {
        title: `${style === 'ordered' ? 'Ordered' : 'Unordered'} list`,
        subtitle: `${items?.length || 0} items`,
      };
    },
  },
});
