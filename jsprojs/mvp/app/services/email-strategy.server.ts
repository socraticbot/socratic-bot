import { SessionStorage, SessionData } from "@remix-run/node";
import { redirect } from "@remix-run/server-runtime";
import {
  AuthenticateOptions,
  Strategy,
  StrategyVerifyCallback,
} from "remix-auth";
import crypto from "crypto-js";
import invariant from "tiny-invariant";

interface EmailVerifyParams {
  email: string;
}

function getDomainURL(request: Request): string {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  if (!host) {
    throw new Error("Could not determine domain URL.");
  }

  const protocol =
    host.includes("localhost") || host.includes("127.0.0.1")
      ? "http"
      : request.headers.get("X-Forwarded-Proto") ?? "https";

  return `${protocol}://${host}`;
}

type MagicLinkPayload = {
  email: string;
  domainURL: string;
  nonce: string;
};

function encryptMagicLinkPayload(payload: MagicLinkPayload): string {
  const plainText = JSON.stringify(payload);
  return crypto.AES.encrypt(plainText, "1234").toString();
}

function decryptMagicLinkPayload(token: string): MagicLinkPayload {
  const plainText = crypto.AES.decrypt(token, "1234").toString(crypto.enc.Utf8);
  const payload = JSON.parse(plainText);

  invariant(typeof payload === "object");
  invariant(payload["email"] && typeof payload["email"] === "string");
  invariant(payload["domainURL"] && typeof payload["domainURL"] === "string");
  invariant(payload["nonce"] && typeof payload["nonce"] === "string");

  return payload;
}

export class EmailStrategy<User> extends Strategy<User, EmailVerifyParams> {
  name = "email";
  secret = "socratic";

  sendEmail: (user: User, link: string) => Promise<void>;

  constructor(
    sendEmail: (user: User, link: string) => Promise<void>,
    verify: StrategyVerifyCallback<User, EmailVerifyParams>
  ) {
    super(verify);
    this.sendEmail = sendEmail;
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage<SessionData, SessionData>,
    options: AuthenticateOptions
  ): Promise<User> {
    if (request.method === "POST") {
      return this.sendEmailFlow(request, sessionStorage, options);
    }
    return this.verifyLinkFlow(request, sessionStorage, options);
  }

  private async sendEmailFlow(
    request: Request,
    sessionStorage: SessionStorage<SessionData, SessionData>,
    options: AuthenticateOptions
  ): Promise<never> {
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    const form = new URLSearchParams(await request.text());
    const email = form.get("email");

    if (!email) {
      session.flash("auth:error", { message: "Missing email address." });
      const cookie = await sessionStorage.commitSession(session);
      throw redirect("/login", {
        headers: { "Set-Cookie": cookie },
      });
    }

    try {
      const user = await this.verify({ email });
      const nonce = await this.sendToken(email, user, getDomainURL(request));
      session.set("auth:last-email", email);
      session.set("auth:last-nonce", nonce);
    } catch (error) {
      const { message } = error as Error;
      session.flash("auth:error", { message });
      const cookie = await sessionStorage.commitSession(session);
      throw redirect("/login", {
        headers: { "Set-Cookie": cookie },
      });
    }

    const cookie = await sessionStorage.commitSession(session);
    throw redirect("/email-sent", {
      headers: { "Set-Cookie": cookie },
    });
  }

  private async verifyLinkFlow(
    request: Request,
    sessionStorage: SessionStorage<SessionData, SessionData>,
    options: AuthenticateOptions
  ): Promise<User> {
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    let user: User;
    try {
      const url = new URL(request.url);
      const token = url.searchParams.get("token");

      if (!token) {
        throw new Error("No token provided.");
      }

      const { email, domainURL, nonce } = decryptMagicLinkPayload(token);
      invariant(domainURL === getDomainURL(request), "Invalid token.");
      const lastNonce = session.get("auth:last-nonce");
      invariant(
        nonce === lastNonce,
        "You should login from the same browser sending the e-mail."
      );

      user = await this.verify({ email });
    } catch (error) {
      const { message } = error as Error;
      session.flash("auth:error", { message });
      const cookie = await sessionStorage.commitSession(session);
      throw redirect("/login", {
        headers: { "Set-Cookie": cookie },
      });
    }

    // if a successRedirect is not set, we return the user
    if (!options.successRedirect) {
      return user;
    }

    session.set(options.sessionKey, user);
    const cookie = await sessionStorage.commitSession(session);
    throw redirect(options.successRedirect, {
      headers: { "Set-Cookie": cookie },
    });
  }

  private async sendToken(
    email: string,
    user: User,
    domainURL: string
  ): Promise<string> {
    const nonce = `${Math.floor(Math.random() * 4294967296)}`;
    const token = encryptMagicLinkPayload({
      email,
      domainURL,
      nonce,
    });

    const url = new URL(domainURL);
    url.pathname = "/complete-login";
    url.searchParams.set("token", token);
    const link = url.href;

    await this.sendEmail(user, link);
    return nonce;
  }
}
