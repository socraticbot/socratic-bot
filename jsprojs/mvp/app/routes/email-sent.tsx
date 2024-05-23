import { LoaderFunctionArgs, json, redirect } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { auth } from '~/services/auth.server'
import { sessionStorage } from '~/services/session.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await auth.isAuthenticated(request, { successRedirect: '/me' })
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const lastEmail = session.get('auth:last-email')
  if (!(lastEmail && typeof lastEmail === 'string')) {
    throw redirect('/login')
  }

  return json({ email: lastEmail })
}

export default function EmailSent() {
  const { email } = useLoaderData<typeof loader>()

  return (
    <Form action="/login" method="post">
      <>
        <p>An email has been sent to {email}.</p>

        <input type="hidden" name="email" value={email} />
        <button type="submit">Send again</button>
      </>
    </Form>
  )
}
