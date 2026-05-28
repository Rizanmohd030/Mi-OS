"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import {
  createFinanceAccount,
  createFinanceTransaction,
  getFinanceAccounts,
  getFinanceLedger,
  type FinanceLedgerResponse,
} from "@/lib/api/finance";

export default function FinancePage() {
  const [ledger, setLedger] = useState<FinanceLedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [accountName, setAccountName] = useState("Main Account");
  const [startingBalance, setStartingBalance] = useState("");
  const [entryType, setEntryType] = useState<"income" | "expense">("expense");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryReason, setEntryReason] = useState("");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  const formatMonth = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await getFinanceAccounts();
      if (accounts.length === 0) {
        setLedger(null);
        return;
      }
      const data = await getFinanceLedger(accounts[0].id, 30);
      setLedger(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load finance ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !startingBalance.trim()) return;

    const balance = Number(startingBalance);
    if (!Number.isFinite(balance) || balance < 0) {
      setError("Starting balance must be a valid non-negative number.");
      return;
    }

    setBusy(true);
    try {
      await createFinanceAccount({
        name: accountName.trim(),
        startingBalance: balance,
      });
      setStartingBalance("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create finance account.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledger || !entryAmount.trim()) return;

    const amount = Number(entryAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a valid number greater than zero.");
      return;
    }

    setBusy(true);
    try {
      await createFinanceTransaction(ledger.account.id, {
        amount,
        type: entryType,
        reason: entryReason.trim() || undefined,
      });
      setEntryAmount("");
      setEntryReason("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add finance entry.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f9] px-6 py-8 text-[#333333] sm:px-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E4E2] px-3 py-2 text-sm text-[#666] transition hover:bg-white"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <p className="text-xs uppercase tracking-widest text-[#888888]">Finance</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-12 w-56 animate-pulse rounded-xl bg-[#efeeeb]" />
            <div className="h-28 animate-pulse rounded-2xl bg-[#efeeeb]" />
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-[#E5E4E2] bg-white/70 p-4 text-sm text-[#777]">{error}</p>
        ) : ledger ? (
          <section className="rounded-2xl border border-[#E5E4E2] bg-white/70 p-8">
            <p className="text-xs uppercase tracking-widest text-[#888888]">Current balance</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight">{formatCurrency(ledger.currentBalance)}</h1>
            <p className="mt-3 text-xs text-[#888888]">
              {ledger.account.name} · Starting {formatMonth(ledger.account.startingBalanceMonth)} at{" "}
              {formatCurrency(ledger.account.startingBalance)}
            </p>

            <form onSubmit={handleCreateEntry} className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#E5E4E2] pt-6">
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as "income" | "expense")}
                className="rounded-xl border border-[#E5E4E2] bg-transparent px-3 py-2 text-sm focus:outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={entryAmount}
                onChange={(e) => setEntryAmount(e.target.value)}
                placeholder="Amount"
                className="w-36 rounded-xl border border-[#E5E4E2] bg-transparent px-3 py-2 text-sm placeholder:text-[#b6b6b6] focus:outline-none"
              />
              <input
                type="text"
                value={entryReason}
                onChange={(e) => setEntryReason(e.target.value)}
                placeholder="Reason"
                className="min-w-[220px] flex-1 rounded-xl border border-[#E5E4E2] bg-transparent px-3 py-2 text-sm placeholder:text-[#b6b6b6] focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl border border-[#E5E4E2] px-4 py-2 text-xs uppercase tracking-wider transition hover:bg-[#f4f3f1] disabled:opacity-60"
              >
                Add line
              </button>
            </form>

            <div className="mt-8 border-t border-[#E5E4E2] pt-6">
              <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-[#888888]">
                <span>Ledger</span>
                <span>Amount</span>
              </div>
              {ledger.transactions.length > 0 ? (
                <div className="space-y-4">
                  {ledger.transactions.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{entry.reason || (entry.type === "income" ? "Income" : "Expense")}</p>
                        <p className="text-xs text-[#888888]">{formatDate(entry.timestamp)}</p>
                      </div>
                      <p className={`text-sm ${entry.type === "expense" ? "text-[#888888]" : "text-[#333333]"}`}>
                        {entry.type === "expense" ? "-" : "+"}
                        {formatCurrency(Math.abs(entry.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#888888]">No transactions yet.</p>
              )}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-[#E5E4E2] bg-white/70 p-8">
            <p className="text-sm text-[#888888]">
              Create your monthly ledger to start tracking balance, income, and expenses.
            </p>
            <form onSubmit={handleCreateAccount} className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account name"
                className="rounded-xl border border-[#E5E4E2] bg-transparent px-3 py-2 text-sm placeholder:text-[#b6b6b6] focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                required
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                placeholder="Starting monthly balance"
                className="rounded-xl border border-[#E5E4E2] bg-transparent px-3 py-2 text-sm placeholder:text-[#b6b6b6] focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-fit rounded-xl border border-[#E5E4E2] px-4 py-2 text-xs uppercase tracking-wider transition hover:bg-[#f4f3f1] disabled:opacity-60"
              >
                Create ledger
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
