export const IMAGE_COMPRESSION_SETTINGS = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.7,
  maxSizeKB: 200,
} as const;

export function estimateBase64Size(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.ceil(((base64.length * 3) / 4 - padding) / 1024);
}

