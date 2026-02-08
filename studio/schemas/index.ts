import article from './article';
import glossaryTerm from './glossaryTerm';
import headingBlock from './objects/headingBlock';
import paragraphBlock from './objects/paragraphBlock';
import quoteBlock from './objects/quoteBlock';
import listBlock from './objects/listBlock';
import calloutBlock from './objects/calloutBlock';
import productCTABlock from './objects/productCTABlock';
import imageBlock from './objects/imageBlock';

export const schemaTypes = [
  // Document types
  article,
  glossaryTerm,
  // Object types
  headingBlock,
  paragraphBlock,
  quoteBlock,
  listBlock,
  calloutBlock,
  productCTABlock,
  imageBlock,
];
