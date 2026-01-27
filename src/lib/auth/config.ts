import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from './password'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: {
              role: true
            }
          })

          if (!user || !user.isActive) {
            return null
          }

          const isPasswordValid = await verifyPassword(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            roleId: user.roleId
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.roleId = user.roleId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.roleId = token.roleId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}