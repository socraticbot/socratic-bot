import { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { getInterviewsByUser } from '~/models/interview.server'
import { auth } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // If the user is here, it's already authenticated, if not redirect them to
  // the login page.
  const user = await auth.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  const interviews = await getInterviewsByUser(user)
  return json({ user, interviews })
}

export default function Me() {
  const { user, interviews } = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <p>You are logged in as {user.email}</p>
      <Form action="/logout" method="post">
        <button>Logout</button>
      </Form>

      <div>
        {
          interviews.map(x => (
            <div key={x.id}>
              <p>Email: {x.recipientEmail}</p>
              <p>Name: {x.recipientName}</p>
              <p>Model: {x.modelName}</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}
