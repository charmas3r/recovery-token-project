import {defineType, defineField, defineArrayMember} from 'sanity';

export default defineType({
  name: 'glossaryTerm',
  title: 'Glossary Term',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Recovery Basics', value: 'Recovery Basics'},
          {title: 'Milestones & Time', value: 'Milestones & Time'},
          {title: 'Tokens & Coins', value: 'Tokens & Coins'},
          {title: 'Support & Community', value: 'Support & Community'},
          {title: 'Programs & Methods', value: 'Programs & Methods'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relatedTerms',
      title: 'Related Terms',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'glossaryTerm'}],
        }),
      ],
    }),
    defineField({
      name: 'productLink',
      title: 'Product Link',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
        }),
        defineField({
          name: 'href',
          title: 'URL',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'category'},
  },
});
