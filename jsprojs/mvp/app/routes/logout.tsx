import { ActionFunctionArgs } from '@remix-run/node'
import { auth } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  // The success redirect is required in this action, this is where the user is
  // going to be redirected after the magic link is sent, note that here the
  // user is not yet authenticated, so you can't send it to a private page.
  await auth.logout(request, { redirectTo: '/login' })
}
