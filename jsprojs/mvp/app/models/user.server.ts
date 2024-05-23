import { prisma } from '~/prisma.server'
import { AuthorizationError } from 'remix-auth'

import type { User } from './user.model'

export type { User } from './user.model'

export async function getUserByEmail(email: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  if (!user) {
    throw new AuthorizationError(`Unknown e-mail ${email}!`)
  }
  return user
}
