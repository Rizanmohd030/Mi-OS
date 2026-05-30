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
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ backgroundColor: "#2e2e2e" }}
    >
      {/* Grid overlay — matches the photo's dark tile pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.35) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      {/* Password Dialog */}
      <section
        className="relative z-10 w-full"
        style={{ maxWidth: "290px" }}
      >
        {/* Black header bar */}
        <div
          style={{
            backgroundColor: "#111111",
            padding: "14px 18px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "13px",
              fontWeight: "bold",
              letterSpacing: "0.18em",
              color: "#ffffff",
              margin: 0,
            }}
          >
            PASSWORD#?
          </h1>
        </div>

        {/* Off-white body */}
        <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: "#e8e5df",
            padding: "20px 18px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Input box */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #c8c3bc",
              padding: "12px 14px",
            }}
          >
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="* * * * * * *"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "22px",
                letterSpacing: "0.35em",
                color: "#000000",
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                letterSpacing: "0.06em",
                color: "#cc3333",
                fontFamily: "'Courier New', Courier, monospace",
              }}
            >
              {error}
            </p>
          )}

          {/* ENTER button — right-aligned */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              style={{
                backgroundColor: "#707070",
                border: "1px solid #5a5a5a",
                color: "#ffffff",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "11px",
                fontWeight: "bold",
                letterSpacing: "0.22em",
                padding: "8px 16px",
                cursor: "pointer",
                opacity: !password.trim() || isSubmitting ? 0.5 : 1,
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!(!password.trim() || isSubmitting))
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5a5a5a";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#707070";
              }}
            >
              {isSubmitting ? "ENTERING" : "ENTER"}
            </button>
          </div>
        </div>
        </form>
      </section>
    </main>
  );
}