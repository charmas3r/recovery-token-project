import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'altText', media: 'image'},
    prepare({title, media}: {title?: string; media?: unknown}) {
      return {
        title: title || 'Untitled image',
        subtitle: 'Image',
        media,
      };
    },
  },
});
