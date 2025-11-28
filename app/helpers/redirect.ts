import { redirect } from "@remix-run/node";
import { route } from "routes-gen";
import { commitSession } from "~/sessions.server";

export async function redirectToRoute(
  routePath: string,
  params: Record<string, string>,
  session?: any,
  headers?: Record<string, string>
) {
  const redirectHeaders: Record<string, string> = { ...headers };

  if (session) {
    redirectHeaders["Set-Cookie"] = await commitSession(session);
  }

  return redirect(route(routePath, params), { headers: redirectHeaders });
}
