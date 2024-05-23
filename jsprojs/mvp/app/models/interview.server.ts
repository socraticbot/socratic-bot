import { prisma } from '~/prisma.server'

import type { User } from './user.model'
import type { Interview } from './interview.model'
export type { User } from './user.model'
export type { Interview } from './interview.model'

export async function getInterviewsByUser(user: User): Promise<Interview[]> {
  const interviews = await prisma.interview.findMany({
    where: {
      owner_id: user.id
    }
  })
  return interviews.map((x): Interview => ({
    id: x.id,
    recipientName: x.recipient_name,
    recipientEmail: x.recipient_email,
    ownerId: x.owner_id,
    modelName: x.model_name,
    modelInput: x.model_input
  }))
}
