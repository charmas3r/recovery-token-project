import {defineType, defineField, defineArrayMember} from 'sanity';

export default defineType({
  name: 'paragraphBlock',
  title: 'Paragraph',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'string',
                    title: 'URL',
                    validation: (Rule) => Rule.required(),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {content: 'content'},
    prepare({content}: {content?: Array<{children?: Array<{text?: string}>}>}) {
      const firstBlock = content?.[0];
      const text = firstBlock?.children?.map((c) => c.text).join('') || 'Empty paragraph';
      return {
        title: text.length > 80 ? text.slice(0, 80) + '...' : text,
      };
    },
  },
});
