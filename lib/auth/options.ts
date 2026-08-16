import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { getDatabase } from "@/lib/db/client";
import { getServerEnvironment } from "@/lib/env/server";

const credentialSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export const authOptions: NextAuthOptions = {
  secret: getServerEnvironment().AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Drive the Market account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const database = getDatabase();
        const user = await database.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        });

        if (!user?.passwordHash || user.status !== "ACTIVE") return null;
        if (!(await compare(parsed.data.password, user.passwordHash)))
          return null;

        const roleKeys = user.roles.map(({ role }) => role.key);
        const permissionKeys = [
          ...new Set(
            user.roles.flatMap(({ role }) =>
              role.permissions.map(({ permission }) => permission.key),
            ),
          ),
        ];

        await database.$transaction([
          database.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }),
          database.auditLog.create({
            data: {
              actorId: user.id,
              action: "auth.login",
              entityType: "User",
              entityId: user.id,
            },
          }),
        ]);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          roleKeys,
          permissionKeys,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.status = user.status;
        token.roleKeys = user.roleKeys;
        token.permissionKeys = user.permissionKeys;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.status = token.status;
        session.user.roleKeys = token.roleKeys;
        session.user.permissionKeys = token.permissionKeys;
      }
      return session;
    },
  },
};
