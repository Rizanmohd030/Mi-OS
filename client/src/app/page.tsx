import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, verifyAuthSessionValue } from "@/lib/auth";
import UnlockClient from "./unlock/UnlockClient";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const authenticated = await verifyAuthSessionValue(session);

  if (authenticated) {
    redirect("/Workspace");
  }

  return <UnlockClient nextPath="/Workspace" />;
}
