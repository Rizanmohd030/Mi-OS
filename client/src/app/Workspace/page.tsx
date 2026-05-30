import HomeClient from "../HomeClient";
import { getProjects } from "@/lib/api/projects";
import { getTasks } from "@/lib/api/tasks";
import { getFinanceAccounts, getFinanceLedger } from "@/lib/api/finance";

export default async function WorkspaceHome() {
  const [initialProjects, initialTasks, initialFinancePreview] = await Promise.all([
    getProjects().catch(() => []),
    getTasks().catch(() => []),
    (async () => {
      const accounts = await getFinanceAccounts().catch(() => []);
      if (!accounts.length) return null;
      return getFinanceLedger(accounts[0].id, 2).catch(() => null);
    })(),
  ]);

  return (
    <HomeClient
      initialProjects={initialProjects}
      initialTasks={initialTasks}
      initialFinancePreview={initialFinancePreview}
    />
  );
}