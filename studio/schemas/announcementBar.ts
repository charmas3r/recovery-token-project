import {defineType, defineField} from 'sanity';

export default defineType({
  name: 'announcementBar',
  title: 'Announcement Bar',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Toggle the announcement banner on or off',
      initialValue: true,
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'string',
      description: 'The banner text displayed to customers',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'linkText',
      title: 'Link Text',
      type: 'string',
      description: 'Optional clickable text appended after the message (e.g. "Shop Now")',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'string',
      description: 'URL for the link text',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Hex color override (e.g. #1A202C). Leave empty for default dark navy.',
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'string',
      description: 'Hex color override (e.g. #FFFFFF). Leave empty for default white.',
    }),
  ],
  preview: {
    select: {
      title: 'message',
      enabled: 'enabled',
    },
    prepare({title, enabled}) {
      return {
        title: title || 'Announcement Bar',
        subtitle: enabled ? 'Enabled' : 'Disabled',
      };
    },
  },
});
