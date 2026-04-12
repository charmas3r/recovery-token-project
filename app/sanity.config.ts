import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {schemaTypes} from '../studio/schemas';

const singletonTypes = new Set(['announcementBar']);

export default defineConfig({
  name: 'recovery-token-store',
  title: 'Recovery Token Store',
  projectId: '7yuseyfn',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Announcement Bar')
              .id('announcementBar')
              .child(
                S.document()
                  .schemaType('announcementBar')
                  .documentId('announcementBar'),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) => !singletonTypes.has(listItem.getId()!),
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },
});
