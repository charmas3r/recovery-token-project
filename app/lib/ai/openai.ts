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
    // DALL-E 3 only generates 1 image per call — parallelize for count > 1
    const promises = Array.from({length: req.count}, () =>
      this.callDallE(req),
    );
    const images = await Promise.all(promises);

    return {
      images,
      provider: 'openai',
      model: 'dall-e-3',
      cost: req.count * 4, // ~$0.04 per 1024x1024 in cents
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

  private async callDallE(req: GenerateImageRequest): Promise<GeneratedImage> {
    const res = await fetch(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: req.prompt,
        n: 1,
        size: req.size,
        style: req.style ?? 'natural',
        response_format: 'url',
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${error}`);
    }

    const data = (await res.json()) as {
      data: Array<{url: string; revised_prompt?: string}>;
    };

    return {
      url: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
    };
  }
}
