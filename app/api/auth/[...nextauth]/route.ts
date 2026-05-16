import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { sendWelcomeEmail } from "@/services/email.service"
import { logger } from "@/lib/logger"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      // Send welcome email to new users
      if (user.email) {
        try {
          // Check if user already received welcome email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { welcomeEmailSent: true }
          });

          // Send welcome email only if user hasn't received it yet
          if (existingUser && !existingUser.welcomeEmailSent) {
            await sendWelcomeEmail(user.email, user.name);
            
            // Update user to mark welcome email as sent
            await prisma.user.update({
              where: { email: user.email },
              data: { welcomeEmailSent: true }
            });
            
            logger.info('[Auth] Welcome email sent', { email: user.email });
          }
        } catch (error) {
          logger.error('[Auth] Error sending welcome email', error as Error);
          // Don't block sign in if email fails
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
