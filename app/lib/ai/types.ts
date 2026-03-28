export interface GenerateImageRequest {
  prompt: string;
  count: number;
  size: '1024x1024';
  style?: 'natural' | 'vivid';
}

export interface GeneratedImage {
  url: string;
  b64Data?: string;  // Raw base64 data for direct upload (no data: prefix)
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
