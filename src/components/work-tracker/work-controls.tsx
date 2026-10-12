"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Coffee, LogOut, Play, Square, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { calculateDailySummary, differenceInMinutes, formatMinutes, type ExtraHoursSettings } from "@/src/features/work-days/calculations/time-calculations";
import { requestJson } from "@/src/lib/client-api";
import type { WorkDayRecord } from "@/src/features/work-days/types";

export function WorkControls({
  today,
  normalWorkingHours,
  extraHoursSettings,
  run,
}: {
  today: WorkDayRecord | null;
  normalWorkingHours: number;
  extraHoursSettings: ExtraHoursSettings;
  run: (label: string, task: () => Promise<unknown>) => Promise<void>;
}) {
  const [action, setAction] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const activeBreak = today?.breaks.find((item) => !item.endTime);

  useEffect(() => {
    if (!today || today.endTime) return;
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, [today]);

  async function execute(name: string, label: string, task: () => Promise<unknown>) {
    setAction(name);
    await run(label, task);
    setAction(null);
  }

  const liveSummary = useMemo(() => {
    if (!today) return null;
    return calculateDailySummary({
      workDate: today.date,
      startTime: today.startTime,
      endTime: today.endTime ?? now,
      normalWorkingMinutes: normalWorkingHours * 60,
      extraHoursSettings,
      breaks: today.breaks.filter((item) => item.endTime),
    });
  }, [extraHoursSettings, normalWorkingHours, now, today]);

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const state = !today ? "idle" : activeBreak ? "break" : today.endTime ? "done" : "working";
  const startedAt = today ? new Date(today.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;
  const endedAt = today?.endTime ? new Date(today.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;
  const breakStartedAt = activeBreak ? new Date(activeBreak.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;
  const breakMinutes = activeBreak ? differenceInMinutes(activeBreak.startTime, now) : 0;

  const statusContent = {
    idle: {
      eyebrow: "Today",
      title: "Ready to start?",
      detail: "Your workday has not started yet.",
      value: formatMinutes(normalWorkingHours * 60),
      valueLabel: "normal target",
      icon: <TimerReset size={32} strokeWidth={1.7} />,
    },
    working: {
      eyebrow: "Working",
      title: `Started at ${startedAt}`,
      detail: "You are currently clocked in.",
      value: formatMinutes(liveSummary?.actualWorkingMinutes ?? 0),
      valueLabel: "worked",
      icon: <span className="h-4 w-4 rounded-full bg-[var(--accent)] shadow-[0_0_24px_var(--accent)]" />,
    },
    break: {
      eyebrow: "On break",
      title: `Break started at ${breakStartedAt}`,
      detail: "The active break is paused from working time.",
      value: formatMinutes(breakMinutes),
      valueLabel: "on break",
      icon: <Coffee size={32} strokeWidth={1.7} />,
    },
    done: {
      eyebrow: "Day completed",
      title: `${startedAt} to ${endedAt}`,
      detail: "Your final totals are ready in work history.",
      value: liveSummary ? `+${formatMinutes(liveSummary.extraMinutes)}` : "+0h 0m",
      valueLabel: "extra",
      icon: <CheckCircle2 size={32} strokeWidth={1.7} />,
    },
  }[state];

  return (
    <Card
      as="section"
      layout
      className={`p-6 pt-8 sm:p-7 sm:pt-9 ${state === "working" ? "ring-1 ring-[var(--accent)]/30" : ""}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-70" />
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-soft)] via-[var(--surface)] to-[color-mix(in_srgb,var(--accent-2)_14%,transparent)] text-[var(--accent)] shadow-[var(--shadow-card)]">
                  {statusContent.icon}
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{statusContent.eyebrow}</p>
              </div>
              <p className="mt-3 text-sm font-medium text-[var(--muted)]">{dateLabel}</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">{statusContent.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{statusContent.detail}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] p-4 text-left shadow-[var(--shadow-card)] lg:min-w-56">
              <p className="text-4xl font-semibold text-[var(--foreground)]">{statusContent.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--subtle)]">{statusContent.valueLabel}</p>
              {liveSummary && state !== "idle" ? (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
                  <div>
                    <p className="text-[var(--subtle)]">Target</p>
                    <p className="font-semibold text-[var(--foreground)]">{formatMinutes(normalWorkingHours * 60)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--subtle)]">Break</p>
                    <p className="font-semibold text-[var(--foreground)]">{formatMinutes(liveSummary.breakMinutes)}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {!today ? (
              <Button
                variant="accent"
                className="h-12 px-6"
                disabled={action !== null}
                icon={<Play size={24} strokeWidth={1.7} />}
                onClick={() => execute("start", `Work started at ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`, () => requestJson("/api/work-days", { method: "POST" }))}
              >
                {action === "start" ? "Starting..." : "Start Work"}
              </Button>
            ) : null}
            {today && !today.endTime && !activeBreak ? (
              <>
                <Button
                  variant="secondary"
                  disabled={action !== null}
                  icon={<Coffee size={24} strokeWidth={1.7} />}
                  onClick={() => execute("break-start", "Break started.", () => requestJson(`/api/work-days/${today.id}/breaks/start`, { method: "POST" }))}
                >
                  {action === "break-start" ? "Starting break..." : "Start Break"}
                </Button>
                <Button
                  variant="danger"
                  disabled={action !== null}
                  icon={<Square size={24} strokeWidth={1.7} />}
                  onClick={() => execute("end", `Workday completed${liveSummary ? ` - +${formatMinutes(liveSummary.extraMinutes)} extra` : ""}.`, () => requestJson(`/api/work-days/${today.id}?mode=end`, { method: "PATCH", body: "{}" }))}
                >
                  {action === "end" ? "Ending..." : "End Work"}
                </Button>
              </>
            ) : null}
            {today && activeBreak ? (
              <Button
                variant="accent"
                disabled={action !== null}
                icon={<LogOut size={24} strokeWidth={1.7} />}
                onClick={() => execute("break-end", "Break ended.", () => requestJson(`/api/work-days/${today.id}/breaks/end`, { method: "POST" }))}
              >
                {action === "break-end" ? "Ending break..." : "End Break"}
              </Button>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
