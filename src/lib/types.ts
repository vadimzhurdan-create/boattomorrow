import { SupplierType, UserRole } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      supplierType: SupplierType
      supplierId: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    supplierType: SupplierType
    supplierId: string
  }
}
