import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

type Role = 'APPLICANT' | 'HR_ADMIN';

// NOTE: Login is email + full name (as entered on the Apply form) — there is
// no separate password. This matches how applicant accounts are created in
// POST /api/applications: a Supabase Auth user + `applications` row keyed by
// email, with no password ever shown to the applicant. We verify identity by
// looking up the most recent `applications` row for that email and checking
// that the provided name matches `full_name` on record.
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Full Name", type: "text" }, // repurposed field: holds full name
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and full name are required");
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const fullNameInput = (credentials.password as string).trim();

        const application = await db.applications.findFirst({
          where: { email },
          orderBy: { date_applied: "desc" },
        });

        if (!application || !application.applicant_user_id) {
          throw new Error("No application found for this email");
        }

        const nameMatches =
          application.full_name.trim().toLowerCase() === fullNameInput.toLowerCase();
        if (!nameMatches) {
          throw new Error("Invalid credentials");
        }

        const profile = await db.profiles.findUnique({
          where: { id: application.applicant_user_id },
        });

        const role = (profile?.role?.toUpperCase() as Role) || "APPLICANT";

        return {
          id: application.applicant_user_id,
          email: application.email,
          name: application.full_name,
          role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? '');
        session.user.role = (token.role as Role | undefined) ?? 'APPLICANT';
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});