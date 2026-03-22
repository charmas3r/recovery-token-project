import type {ImageGenerationProvider} from './types';
import {OpenAIProvider} from './openai';

export function createImageProvider(env: {
  AI_IMAGE_PROVIDER?: string;
  OPENAI_API_KEY?: string;
}): ImageGenerationProvider {
  const provider = env.AI_IMAGE_PROVIDER || 'openai';

  switch (provider) {
    case 'openai':
      return new OpenAIProvider(env.OPENAI_API_KEY!);
    default:
      throw new Error(`Unknown AI image provider: ${provider}. Set AI_IMAGE_PROVIDER to 'openai'.`);
  }
}
