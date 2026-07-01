import { DefaultSession, DefaultUser } from 'next-auth';

type Role = 'APPLICANT' | 'HR_ADMIN';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: Role;
    };
  }

  interface User extends DefaultUser {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
  }
}