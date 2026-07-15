// Demo-only store for the resume/cover letter files selected during
// application. Files are converted to base64 data URLs and saved in
// sessionStorage, so — unlike a plain in-memory JS variable — they survive
// page refreshes within the same browser tab (cleared when the tab closes,
// since a real backend/file storage isn't wired up yet).

const RESUME_KEY = 'arvinDemoResumeFile';
const COVER_KEY = 'arvinDemoCoverLetterFile';

export type StoredDemoFile = { name: string; type: string; dataUrl: string };

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function setDemoFiles(resume: File | null, coverLetter: File | null) {
  if (typeof window === 'undefined') return;
  console.log(resume,coverLetter)
  try {
    if (resume) {
      const dataUrl = await fileToDataUrl(resume);
      sessionStorage.setItem(RESUME_KEY, JSON.stringify({ name: resume.name, type: resume.type, dataUrl }));
    } else {
      sessionStorage.removeItem(RESUME_KEY);
    }
  } catch {
    /* file too large for sessionStorage, or storage unavailable — viewer will show N/A */
  }

  try {
    if (coverLetter) {
      const dataUrl = await fileToDataUrl(coverLetter);
      sessionStorage.setItem(COVER_KEY, JSON.stringify({ name: coverLetter.name, type: coverLetter.type, dataUrl }));
    } else {
      sessionStorage.removeItem(COVER_KEY);
    }
  } catch {
    /* same as above */
  }
}

function readStored(key: string): StoredDemoFile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDemoFile;
  } catch {
    return null;
  }
}

export function getDemoResumeFile(): StoredDemoFile | null {
  return readStored(RESUME_KEY);
}

export function getDemoCoverLetterFile(): StoredDemoFile | null {
  return readStored(COVER_KEY);
}

export function clearDemoFiles() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(RESUME_KEY);
  sessionStorage.removeItem(COVER_KEY);
}
