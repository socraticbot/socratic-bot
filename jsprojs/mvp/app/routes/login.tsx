import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { auth } from '~/services/auth.server'
import { sessionStorage } from '~/services/session.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await auth.isAuthenticated(request, { successRedirect: '/me' })
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const lastEmail = session.get('auth:last-email')
  if (lastEmail && typeof lastEmail === 'string') {
    return json({ lastEmail })
  }
  return json({ lastEmail: null })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  // The success redirect is required in this action, this is where the user is
  // going to be redirected after the magic link is sent, note that here the
  // user is not yet authenticated, so you can't send it to a private page.
  await auth.authenticate('email', request)
}

// app/routes/login.tsx
export default function Login() {
  const { lastEmail } = useLoaderData<typeof loader>()
  const [email, setEmail] = useState(lastEmail || '')

  return (
    <Form action="/login" method="post">
      <>
        <h1>Log in to your account.</h1>
        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button>Email a login link</button>
      </>
    </Form>
  )
}
