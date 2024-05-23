import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { User, getUserByEmail } from "~/models/user.server";

import { EmailStrategy } from "./email-strategy.server";
import { sendEmail } from "./email.server";

// This secret is used to encrypt the token sent in the magic link and the
// session used to validate someone else is not trying to sign-in as another
// user.
const secret = "socratic"; //process.env.MAGIC_LINK_SECRET
if (!secret) throw new Error("Missing MAGIC_LINK_SECRET env variable.");

export const auth = new Authenticator<User>(sessionStorage);

// Here we need the sendEmail, the secret and the URL where the user is sent
// after clicking on the magic link
auth.use(
  new EmailStrategy(sendEmail, async ({ email }) => {
    return await getUserByEmail(email);
  })
);
