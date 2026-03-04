import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const supplier = await prisma.supplier.findUnique({
          where: { email: credentials.email },
        })

        if (!supplier) return null
        if (supplier.status === 'blocked') return null

        const isValid = await bcrypt.compare(credentials.password, supplier.passwordHash)
        if (!isValid) return null

        return {
          id: supplier.id,
          email: supplier.email,
          name: supplier.name,
          role: supplier.role,
          supplierType: supplier.type,
          supplierId: supplier.id,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.supplierType = (user as any).supplierType
        token.supplierId = (user as any).supplierId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const u = session.user as Record<string, any>
        u.id = token.sub ?? ''
        u.role = token.role
        u.supplierType = token.supplierType
        u.supplierId = token.supplierId
      }
      return session
    },
  },
}
