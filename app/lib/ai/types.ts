export interface GenerateImageRequest {
  prompt: string;
  count: number;
  size: '1024x1024';
  style?: 'natural' | 'vivid';
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

export interface GenerateImageResult {
  images: GeneratedImage[];
  provider: string;
  model: string;
  cost?: number;
}

export interface ImageGenerationProvider {
  generate(req: GenerateImageRequest): Promise<GenerateImageResult>;
  healthCheck(): Promise<boolean>;
}
