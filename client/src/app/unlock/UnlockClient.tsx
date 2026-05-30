"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UnlockClientProps = {
  nextPath: string;
};

export default function UnlockClient({
  nextPath,
}: UnlockClientProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!password.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          password: password.trim(),
        }),
      });

      const result =
        await response.json();

      if (!response.ok || !result?.ok) {
        setError("Incorrect password.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Unable to unlock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0b0b] px-6">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_35%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.02),transparent_45%)]" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(230,230,230,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,230,230,0.10) 1px, transparent 1px)",
          backgroundSize: "240px 240px",
        }}
      />

      {/* Noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Password Box */}
      <section className="relative z-10 w-full max-w-[420px] border border-[#d8d2c8] bg-[#F5F3EF] shadow-[0_40px_120px_rgba(0,0,0,0.75)]">

        {/* Header */}
        <div className="border-b border-white/10 bg-black px-8 py-6">
          <h1 className="text-[15px] font-semibold tracking-[0.32em] text-white">
            PASSWORD#?
          </h1>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 px-8 py-8"
        >

          {/* Input Area */}
          <div className="border border-[#d3cdc3] bg-white px-5 py-5">
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="✱ ✱ ✱ ✱ ✱ ✱"
              className="w-full bg-transparent text-[34px] tracking-[0.18em] text-black outline-none placeholder:text-[#bdb7ae]"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs tracking-[0.08em] text-red-500">
              {error}
            </p>
          )}

          {/* Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                !password.trim() ||
                isSubmitting
              }
              className="border border-[#a8a39c] bg-[#9f9b96] px-7 py-3 text-[13px] font-semibold tracking-[0.28em] text-white transition-all duration-200 hover:bg-[#8f8b86] disabled:opacity-40"
            >
              {isSubmitting
                ? "ENTERING"
                : "ENTER"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}