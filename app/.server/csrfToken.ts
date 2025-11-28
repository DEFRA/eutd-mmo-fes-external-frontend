import { randomBytes } from "crypto";
import { isTestEnv } from "~/helpers";
import { getSessionFromRequest } from "~/sessions.server";

export async function createCSRFToken(request: Request) {
  const session = await getSessionFromRequest(request);
  return session.has("csrf") ? session.get("csrf") : randomBytes(100).toString("base64");
}

export async function validateCSRFToken(request: Request, form: FormData): Promise<boolean> {
  if (!form?.has("csrf")) return false;
  const session = await getSessionFromRequest(request);
  if (!session.has("csrf")) return false;
  const formCsrf = form.get("csrf") as string;
  const sessionCsrf = session.get("csrf");
  session.unset("csrf");
  return formCsrf === sessionCsrf || isTestEnv();
}
