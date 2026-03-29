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
      const errorBody = await res.text().catch(() => 'unknown');
      console.error(`OpenAI API error (${res.status}):`, errorBody);

      // Parse error details
      let errorCode = '';
      try {
        const parsed = JSON.parse(errorBody);
        errorCode = parsed?.error?.code ?? '';
      } catch { /* ignore */ }

      if (res.status === 401) {
        throw new Error('SYSTEM_ERROR: Image generation service is not configured correctly. Please contact support.');
      }
      if (res.status === 429) {
        throw new Error('SYSTEM_ERROR: Image generation is temporarily unavailable due to high demand. Please try again in a few minutes.');
      }
      if (errorCode === 'safety_system' || errorCode === 'content_policy_violation' || errorBody.includes('safety system')) {
        throw new Error('SAFETY_REJECTED: Your design description was flagged by our content filter. Please try rephrasing — avoid specific names, trademarked symbols, or language that could be misinterpreted. Focus on describing the visual elements you want on your coin.');
      }
      throw new Error('SYSTEM_ERROR: Image generation failed. Please try again.');
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
