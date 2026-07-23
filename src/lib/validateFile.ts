export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_LABEL = "10MB";

/**
 * Returns an error message if the file exceeds the max size, or null if it's fine.
 */
export function validateFileSize(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_LABEL}.`;
  }
  return null;
}