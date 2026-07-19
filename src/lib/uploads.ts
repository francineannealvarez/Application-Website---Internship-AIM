import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Saves an uploaded File to disk under public/uploads and returns the
 * public path plus display metadata. Used by API routes that need to
 * persist an applicant-submitted file (SRA answer sheet, background
 * check signature, requirement documents, etc.) without needing a
 * dedicated Supabase Storage bucket per feature.
 */
export async function saveUpload(
  file: File,
  prefix: string = ""
): Promise<{ path: string; name: string; sizeLabel: string }> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${prefix}${safeName}`;
  const diskPath = path.join(uploadDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  const sizeLabel =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

  return {
    path: `/uploads/${fileName}`,
    name: file.name,
    sizeLabel,
  };
}