import { randomBytes } from "crypto";
import { isTestEnv } from "~/helpers";
import { getSessionFromRequest } from "~/sessions.server";

export function createCSRFToken() {
  return randomBytes(100).toString("base64");
}

export async function validateCSRFToken(request: Request, form: FormData): Promise<boolean> {
  if (!form?.has("csrf")) return false;
  const session = await getSessionFromRequest(request);
  if (!session.has("csrf")) return false;
  const formCsrf = form.get("csrf") as string;
  return formCsrf === session.get("csrf") || isTestEnv();
}
