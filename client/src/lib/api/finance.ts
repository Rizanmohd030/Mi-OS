const API_BASE = "http://localhost:5047/api/finance";

export type FinanceAccount = {
  id: number;
  name: string;
  startingBalance: number;
  startingBalanceMonth: string;
  createdAt: string;
};

export type FinanceTransaction = {
  id: number;
  accountId: number;
  amount: number;
  type: "income" | "expense";
  reason: string;
  timestamp: string;
};

export type FinanceLedgerResponse = {
  account: FinanceAccount;
  currentBalance: number;
  transactions: FinanceTransaction[];
};

export async function getFinanceAccounts() {
  const response = await fetch(`${API_BASE}/accounts`);

  if (!response.ok) {
    throw new Error("Failed to fetch finance accounts");
  }

  return response.json() as Promise<FinanceAccount[]>;
}

export async function createFinanceAccount(data: {
  name: string;
  startingBalance: number;
  startingBalanceMonth?: string;
}) {
  const response = await fetch(`${API_BASE}/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Failed to create finance account: ${response.status} ${details || response.statusText}`
    );
  }

  return response.json() as Promise<FinanceAccount>;
}

export async function getFinanceLedger(accountId: number, limit = 5) {
  const response = await fetch(
    `${API_BASE}/accounts/${accountId}/ledger?limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch finance ledger");
  }

  return response.json() as Promise<FinanceLedgerResponse>;
}

export async function createFinanceTransaction(
  accountId: number,
  data: {
    amount: number;
    type: "income" | "expense";
    reason?: string;
    timestamp?: string;
  }
) {
  const response = await fetch(`${API_BASE}/accounts/${accountId}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Failed to create finance transaction: ${response.status} ${details || response.statusText}`
    );
  }

  return response.json() as Promise<FinanceTransaction>;
}

export async function updateFinanceTransaction(
  accountId: number,
  transactionId: number,
  data: {
    amount: number;
    type: "income" | "expense";
    reason?: string;
    timestamp?: string;
  }
) {
  const response = await fetch(`${API_BASE}/accounts/${accountId}/transactions/${transactionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Failed to update finance transaction: ${response.status} ${details || response.statusText}`);
  }

  return response.json() as Promise<FinanceTransaction>;
}

export async function deleteFinanceTransaction(accountId: number, transactionId: number) {
  const response = await fetch(`${API_BASE}/accounts/${accountId}/transactions/${transactionId}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    const details = await response.text().catch(() => "");
    throw new Error(`Failed to delete finance transaction: ${response.status} ${details || response.statusText}`);
  }
}

export async function deleteFinanceAccount(accountId: number) {
  const response = await fetch(`${API_BASE}/accounts/${accountId}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    const details = await response.text().catch(() => "");
    throw new Error(`Failed to delete finance account: ${response.status} ${details || response.statusText}`);
  }
}
