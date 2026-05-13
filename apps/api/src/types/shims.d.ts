declare module "canvas" {
  export function createCanvas(width: number, height: number): {
    getContext(contextId: "2d"): unknown;
    toBuffer(mimeType?: string): Buffer;
  };
}
