import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { renderToString } from "react-dom/server";
import type { User } from "~/models/user.model";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

export const sendEmail = async (user: User, link: string) => {
  const subject = "Log In to Your Socratic Account";
  const body = renderToString(
    <p>
      Hi {user.name},<br />
      <br />
      <a href={link}>Click here to log in to Socratic</a>
    </p>
  );

  const command = new SendEmailCommand({
    Source: "support@socratic.ai",
    Destination: {
      ToAddresses: [user.email],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: body,
          Charset: "UTF-8",
        },
      },
    },
  });
  try {
    await sesClient.send(command);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
