export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: 'APPLICANT' | 'HR_ADMIN';
};

export type DemoApplication = {
  fullName: string;
  email: string;
  phone: string;
  positionTitle: string;
  resumeFileName: string;
  coverLetterFileName?: string | null;
  submittedAt: string; // ISO date string
};

const DEMO_USER_KEY = 'mockUser';
const DEMO_APPLICATION_KEY = 'mockApplicationData';

export function readDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function writeDemoUser(user: DemoUser) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
}

export function clearDemoUser() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DEMO_USER_KEY);
}

export function readDemoApplication(): DemoApplication | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DEMO_APPLICATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoApplication;
  } catch {
    return null;
  }
}

export function writeDemoApplication(app: DemoApplication) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DEMO_APPLICATION_KEY, JSON.stringify(app));
}

export function clearDemoApplication() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DEMO_APPLICATION_KEY);
}
