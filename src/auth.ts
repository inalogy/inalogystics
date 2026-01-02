import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in database when they sign in
      if (user.email) {
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || null,
              image: user.image || null,
            },
            create: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              emailVerified: new Date(),
            },
          })
        } catch (error) {
          console.error('Error creating/updating user:', error)
          // Don't block sign-in if database operation fails
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user info to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.id = profile?.sub
      }

      // Get user ID from database based on email
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true }
          })
          if (dbUser) {
            token.userId = dbUser.id
          }
        } catch (error) {
          console.error('Error fetching user ID:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client, including database user ID
      if (session?.user) {
        session.user.id = token.userId as string || token.sub!
        // You can add more user properties from Azure AD profile here
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt", // Use JWT instead of database sessions
  },
})
