export type CmsImageUploadInput = {
  buffer: Buffer;
  mimeType: string;
  size: number;
  extension: string;
};

export type CmsImageUploadOutput = {
  url: string;
  filename: string;
};

export type CmsImageStorageProvider = {
  uploadImage(input: CmsImageUploadInput): Promise<CmsImageUploadOutput>;
};

export type CmsImageStorageProviderName = "local" | "vercel-blob";
