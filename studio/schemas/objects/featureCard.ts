import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'featureCard',
  title: 'Feature Card',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Icon identifier for the feature card',
      options: {
        list: [
          {title: 'Diamond', value: 'diamond'},
          {title: 'Shield Check', value: 'shieldCheck'},
          {title: 'Heart', value: 'heart'},
          {title: 'Sparkles', value: 'sparkles'},
          {title: 'Star', value: 'star'},
          {title: 'Trophy', value: 'trophy'},
          {title: 'Gift', value: 'gift'},
          {title: 'Leaf', value: 'leaf'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required().max(200),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'icon',
    },
  },
});
