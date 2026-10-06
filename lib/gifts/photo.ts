import sharp from "sharp";

/** Re-encode uploads to validate their contents and remove original metadata. */
export async function processGiftPhoto(input: Buffer): Promise<Buffer> {
  if (!input.length || input.length > 2 * 1024 * 1024) throw new Error("A foto precisa ter até 2 MB após o ajuste.");
  const image = sharp(input, { limitInputPixels: 40_000_000, animated: false });
  const metadata = await image.metadata();
  if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) > 1) {
    throw new Error("Escolha uma foto JPG, PNG ou WebP, sem animação.");
  }
  const output = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  if (output.length > 2 * 1024 * 1024) throw new Error("Escolha uma foto menor.");
  return output;
}
