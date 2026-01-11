import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { sendWelcomeEmail } from "@/services/email.service"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "public_profile",
        }
      },
      userinfo: {
        url: "https://graph.facebook.com/me?fields=id,name,picture",
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: `${profile.id}@facebook.com`,
          image: profile.picture?.data?.url ?? null,
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile, isNewUser }) {
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
            
            console.log(`Welcome email sent to ${user.email}`);
          }
        } catch (error) {
          console.error('Error sending welcome email:', error);
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
