"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createFinanceAccount,
  createFinanceTransaction,
  deleteFinanceAccount,
  deleteFinanceTransaction,
  getFinanceAccounts,
  getFinanceLedger,
  updateFinanceTransaction,
  type FinanceLedgerResponse,
} from "@/lib/api/finance";

type MonthlyLedger = FinanceLedgerResponse;

type MonthlyTransactionPayload = {
  amount: number;
  type: "income" | "expense";
  reason?: string;
  timestamp: string;
};

const toMonthLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

const toDateInputValue = (value: string | Date) => {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const formatEntryDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

const stripCurrency = (value: string) => value.replace(/[$,\s]/g, "").trim();

function MonthLedgerCard({
  ledger,
  busy,
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onDeleteAccount,
}: {
  ledger: MonthlyLedger;
  busy: boolean;
  onCreateTransaction: (accountId: number, payload: MonthlyTransactionPayload) => Promise<void>;
  onUpdateTransaction: (accountId: number, transactionId: number, payload: MonthlyTransactionPayload) => Promise<void>;
  onDeleteTransaction: (accountId: number, transactionId: number) => Promise<void>;
  onDeleteAccount: (accountId: number) => Promise<void>;
}) {
  const [entryType, setEntryType] = useState<"income" | "expense">("expense");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryReason, setEntryReason] = useState("");
  const [entryDate, setEntryDate] = useState(() => toDateInputValue(ledger.account.startingBalanceMonth));

  const entries = [
    {
      id: 0,
      label: "Initial added",
      amount: ledger.account.startingBalance,
      date: ledger.account.startingBalanceMonth,
      type: "initial" as const,
    },
    ...ledger.transactions.map((entry) => ({
      id: entry.id,
      label: entry.reason || (entry.type === "income" ? "Income" : "Expense"),
      amount: entry.amount,
      date: entry.timestamp,
      type: entry.type,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const spent = entries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const normalized = stripCurrency(entryAmount);
    const amount = Number(normalized);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    await onCreateTransaction(ledger.account.id, {
      amount,
      type: entryType,
      reason: entryReason.trim() || undefined,
      timestamp: new Date(entryDate).toISOString(),
    });

    setEntryAmount("");
    setEntryReason("");
    setEntryType("expense");
    setEntryDate(toDateInputValue(ledger.account.startingBalanceMonth));
  };

  const handleEdit = async (entry: { id: number; label: string; amount: number; date: string; type: "initial" | "income" | "expense" }) => {
    if (entry.type === "initial") return;

    const nextReason = window.prompt("Edit reason", entry.label);
    if (nextReason === null) return;

    const nextAmount = window.prompt("Edit amount", String(Math.abs(entry.amount)));
    if (nextAmount === null) return;

    const normalized = stripCurrency(nextAmount);
    const amount = Number(normalized);
    if (!Number.isFinite(amount) || amount <= 0) return;

    const nextType = window.prompt("Type income or expense", entry.type);
    if (nextType === null) return;

    const type = nextType.trim().toLowerCase() === "income" ? "income" : "expense";

    await onUpdateTransaction(ledger.account.id, entry.id, {
      amount,
      type,
      reason: nextReason.trim(),
      timestamp: entry.date,
    });
  };

  const handleDelete = async (entry: { id: number; type: "initial" | "income" | "expense" }) => {
    if (entry.type === "initial") return;

    const confirmed = window.confirm("Delete this entry?");
    if (!confirmed) return;

    await onDeleteTransaction(ledger.account.id, entry.id);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(`Delete ${toMonthLabel(ledger.account.startingBalanceMonth)}?`);
    if (!confirmed) return;

    await onDeleteAccount(ledger.account.id);
  };

  return (
    <section className="rounded-[24px] border border-[#E5E4E2] bg-white/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-8">
      <div className="flex items-start justify-between gap-4 border-b border-[#E5E4E2] pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#888888]">{toMonthLabel(ledger.account.startingBalanceMonth)}</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{formatCurrency(ledger.account.startingBalance)}</h2>
          <p className="mt-1 text-sm text-[#888888]">Initial money stays fixed</p>
        </div>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="rounded p-2 text-[#888888] transition hover:bg-[#f7f7f7] hover:text-red-500"
          title="Delete month"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-4 overflow-hidden bg-white">
        <div className="border-b border-[#E5E4E2] px-1 pb-2 text-[11px] uppercase tracking-[0.25em] text-[#888888]">
          Expenses and income
        </div>

        {entries.map((entry) => {
          const isInitial = entry.type === "initial";
          const isExpense = entry.type === "expense";

          return (
            <div key={entry.id} className="group flex items-center gap-3 border-b border-[#E5E4E2] px-1 py-3 text-sm">
              <div className="w-20 shrink-0 text-xs text-[#888888]">{formatEntryDate(entry.date)}</div>
              <div className="min-w-0 flex-1 truncate">{entry.label}</div>
              <div className={`w-24 shrink-0 text-right text-sm font-medium ${isInitial ? "text-[#333333]" : isExpense ? "text-[#e11d48]" : "text-[#10b981]"}`}>
                {isInitial ? "" : isExpense ? "-" : "+"}{formatCurrency(Math.abs(entry.amount))}
              </div>
              <div className="flex w-16 shrink-0 items-center justify-end gap-1">
                {!isInitial && (
                  <>
                    <button type="button" onClick={() => handleEdit(entry)} className="rounded p-1 text-[#888888] hover:bg-[#f7f7f7] hover:text-[#333]" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => handleDelete(entry)} className="rounded p-1 text-[#888888] hover:bg-[#f7f7f7] hover:text-red-500" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-[#faf9f9] px-1 py-4">
          <Plus size={16} className="text-[#0058be]" />

          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="h-9 w-36 border-0 bg-transparent px-0 text-sm text-[#666] focus:outline-none"
            title="Date"
          />

          <input
            type="text"
            value={entryReason}
            onChange={(e) => setEntryReason(e.target.value)}
            placeholder="Add expense or income..."
            className="flex-1 border-0 bg-transparent px-0 text-sm placeholder:text-[#c4c7c7] focus:outline-none"
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            required
            value={entryAmount}
            onChange={(e) => setEntryAmount(e.target.value)}
            placeholder="Amount"
            className="h-9 w-28 border-0 bg-transparent px-0 text-right text-sm placeholder:text-[#c4c7c7] focus:outline-none"
          />

          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-[#111827] px-3 py-1.5 text-xs text-white transition hover:bg-[#0f172a] disabled:opacity-60"
            title="Save"
          >
            Save
          </button>
        </form>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#E5E4E2] pt-4 text-sm">
        <p className="font-medium">Remaining balance</p>
        <p className="font-semibold text-[#333333]">{formatCurrency(ledger.currentBalance)}</p>
      </div>
    </section>
  );
}

export default function FinancePage() {
  const [monthlyLedgers, setMonthlyLedgers] = useState<MonthlyLedger[]>([]);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [modalAmount, setModalAmount] = useState("");
  const [modalDate, setModalDate] = useState(() => toDateInputValue(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const parseAmount = (value: string) => {
    const normalized = value.replace(/[$,\s]/g, "").trim();
    return Number(normalized);
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await getFinanceAccounts();
      if (accounts.length === 0) {
        setMonthlyLedgers([]);
        return;
      }

      const ledgers = await Promise.all(accounts.map((account) => getFinanceLedger(account.id, 100)));
      ledgers.sort((a, b) => new Date(b.account.startingBalanceMonth).getTime() - new Date(a.account.startingBalanceMonth).getTime());
      setMonthlyLedgers(ledgers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load finance ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateInitial = async (e: FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(modalAmount || "");
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid initial amount.");
      return;
    }

    setBusy(true);
    try {
      const accounts = await getFinanceAccounts();
      const monthLabel = toMonthLabel(new Date(modalDate).toISOString());
      const exists = accounts.some((account) => toMonthLabel(account.startingBalanceMonth) === monthLabel);

      if (exists) {
        setError(`A ledger already exists for ${monthLabel}. Use that month card to add expenses.`);
        return;
      }

      await createFinanceAccount({
        name: monthLabel,
        startingBalance: amount,
        startingBalanceMonth: new Date(modalDate).toISOString(),
      });

      setModalAmount("");
      setShowInitialModal(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create finance account.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateTransaction = async (accountId: number, payload: MonthlyTransactionPayload) => {
    setBusy(true);
    try {
      await createFinanceTransaction(accountId, payload);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add finance entry.");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateTransaction = async (accountId: number, transactionId: number, payload: MonthlyTransactionPayload) => {
    setBusy(true);
    try {
      await updateFinanceTransaction(accountId, transactionId, payload);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update finance entry.");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTransaction = async (accountId: number, transactionId: number) => {
    setBusy(true);
    try {
      await deleteFinanceTransaction(accountId, transactionId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete finance entry.");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    setBusy(true);
    try {
      await deleteFinanceAccount(accountId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete monthly card.");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f9] px-5 py-6 text-[#333333] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#E5E4E2] bg-white px-3 py-2 text-sm text-[#666] transition hover:bg-[#f4f3f1]">
            <ArrowLeft size={16} />
            Back
          </Link>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#888888]">Finance</p>
        </div>

        <div className="rounded-[12px] border border-[#E5E4E2] bg-white/60 p-4">
          <p className="text-sm text-[#444444]">Monthly finance tracker. Create one ledger per month, spend inside that month, and keep earlier months below.</p>
          <div className="mt-3 flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-3 py-1.5 text-sm text-white" onClick={() => setShowInitialModal(true)}>
              Add Initial Money +
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-10 w-52 animate-pulse rounded-full bg-[#efeeeb]" />
            <div className="h-40 animate-pulse rounded-3xl bg-[#efeeeb]" />
          </div>
        ) : error ? (
          <p className="rounded-3xl border border-[#E5E4E2] bg-white/80 p-4 text-sm text-[#777]">{error}</p>
        ) : monthlyLedgers.length > 0 ? (
          <section className="space-y-6">
            

            {monthlyLedgers.map((ledger) => (
              <MonthLedgerCard
                key={ledger.account.id}
                ledger={ledger}
                onCreateTransaction={handleCreateTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onDeleteAccount={handleDeleteAccount}
                busy={busy}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-[28px] border border-[#E5E4E2] bg-white/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-8">
            <p className="text-sm text-[#888888]">No monthly ledger yet. Add initial money for June to start your first month.</p>
          </section>
        )}
      </div>

      {showInitialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-medium">Create Month Ledger</h3>
            <p className="mt-2 text-sm text-[#666]">Enter the starting money for a new month. Each month gets its own ledger.</p>

            <form onSubmit={handleCreateInitial} className="mt-4 space-y-3">
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                required
                value={modalAmount}
                onChange={(e) => setModalAmount(e.target.value)}
                placeholder="Amount"
                className="w-full h-10 border-b border-[#E5E4E2] bg-transparent px-2 text-sm focus:outline-none"
              />

              <div className="flex items-center gap-3">
                <label className="text-sm text-[#666]">Date</label>
                <input
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="h-9 rounded-md border border-[#E5E4E2] px-2 text-sm"
                />
                <button type="button" className="ml-auto text-sm text-[#666]" onClick={() => setModalDate(toDateInputValue(new Date()))}>
                  Today
                </button>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button type="button" className="px-3 py-1 text-sm" onClick={() => setShowInitialModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-[#111827] px-3 py-1 text-sm text-white" disabled={busy}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
