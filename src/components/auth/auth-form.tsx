"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/input";
import { Toast } from "@/src/components/ui/toast";
import { requestJson } from "@/src/lib/client-api";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      const payload = Object.fromEntries(formData);
      await requestJson(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)]">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <section className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
              <Clock3 size={24} />
            </div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              <Sparkles size={14} className="text-[var(--accent)]" />
              Premium time tracking
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)] sm:text-6xl">
              Extra hours, counted cleanly.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
              Track work sessions, breaks, monthly totals, and exportable records from a private dashboard.
            </p>
          </div>

          <form
            action={submit}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8"
          >
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {mode === "login" ? "Log in to open your dashboard." : "Set your normal day and start tracking."}
            </p>
            <div className="mt-6 grid gap-4">
              {mode === "register" ? (
                <Field label="Name">
                  <Input name="name" autoComplete="name" required minLength={2} />
                </Field>
              ) : null}
              <Field label="Email">
                <Input name="email" type="email" autoComplete="email" required />
              </Field>
              <Field label="Password">
                <Input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} />
              </Field>
              {mode === "register" ? (
                <Field label="Normal daily working hours">
                  <Input name="dailyWorkingHours" type="number" min={1} max={24} defaultValue={8} required />
                </Field>
              ) : null}
            </div>
            <Button className="mt-6 w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </Button>
            <a
              className="mt-5 block text-center text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
              href={mode === "login" ? "/register" : "/login"}
            >
              {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
            </a>
          </form>
        </section>
      </main>
      <Toast message={message} />
    </div>
  );
}
