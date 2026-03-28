import type {
  GenerateImageRequest,
  GenerateImageResult,
  GeneratedImage,
  ImageGenerationProvider,
} from './types';

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';

export class OpenAIProvider implements ImageGenerationProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAI provider');
    }
    this.apiKey = apiKey;
  }

  async generate(req: GenerateImageRequest): Promise<GenerateImageResult> {
    const res = await fetch(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1.5',
        prompt: req.prompt,
        n: req.count,
        size: req.size,
        quality: 'medium',
      }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Image generation service is not configured correctly. Please contact support.');
      }
      if (res.status === 429) {
        throw new Error('Image generation is temporarily unavailable due to high demand. Please try again in a few minutes.');
      }
      throw new Error(`Image generation failed (error ${res.status}). Please try again.`);
    }

    const data = (await res.json()) as {
      data: Array<{url?: string; b64_json?: string; revised_prompt?: string}>;
    };

    const images: GeneratedImage[] = data.data.map((item) => ({
      url: item.url ?? `data:image/png;base64,${item.b64_json}`,
      b64Data: item.b64_json ?? undefined,
      revisedPrompt: item.revised_prompt,
    }));

    return {
      images,
      provider: 'openai',
      model: 'gpt-image-1.5',
      cost: req.count * 4,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {Authorization: `Bearer ${this.apiKey}`},
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
