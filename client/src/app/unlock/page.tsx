import UnlockClient from "./UnlockClient";

type UnlockPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

function safeNextPath(value: string | string[] | undefined) {
  const nextValue = Array.isArray(value) ? value[0] : value;

  if (!nextValue || !nextValue.startsWith("/")) {
    return "/";
  }

  return nextValue;
}

export default async function UnlockPage({ searchParams }: UnlockPageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const nextPath = safeNextPath(resolvedSearchParams.next) || "/Workspace";

  return <UnlockClient nextPath={nextPath} />;
}