"use client";

import { Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/input";
import { calculateDailySummary, formatMinutes, type ExtraHoursSettings } from "@/src/features/work-days/calculations/time-calculations";
import { requestJson } from "@/src/lib/client-api";
import type { WorkDayRecord } from "@/src/features/work-days/types";

function toLocalTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(11, 19);
}

function dateFromDateAndTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

function addOneDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  return nextDate;
}

function workDateTimes(date: string, startTime: string, endTime?: string | null) {
  const start = dateFromDateAndTime(date, startTime);
  if (!endTime) return { start, end: null };

  let end = dateFromDateAndTime(date, endTime);
  if (end <= start) {
    end = addOneDay(end);
  }

  return { start, end };
}

function breakDateTimes(date: string, workStart: Date, breakStartTime: string, breakEndTime: string) {
  let start = dateFromDateAndTime(date, breakStartTime);
  if (start < workStart) {
    start = addOneDay(start);
  }

  let end = dateFromDateAndTime(date, breakEndTime);
  if (end <= start) {
    end = addOneDay(end);
  }

  return { start, end };
}

type DraftBreak = {
  tempId: string;
  startTime: string;
  endTime: string;
};

export function WorkDayForm({
  record,
  normalWorkingHours,
  extraHoursSettings,
  onCancel,
  onSaved,
}: {
  record?: WorkDayRecord | null;
  normalWorkingHours: number;
  extraHoursSettings: ExtraHoursSettings;
  onCancel?: () => void;
  onSaved: () => Promise<void>;
}) {
  const defaultStart = record?.startTime ? toLocalTimeInput(record.startTime) : "";
  const defaultEnd = record?.endTime ? toLocalTimeInput(record.endTime) : "";
  const initialBreaks = useMemo<DraftBreak[]>(
    () =>
      record?.breaks
        .filter((item) => item.endTime)
        .map((item) => ({
          tempId: item.id,
          startTime: toLocalTimeInput(item.startTime),
          endTime: toLocalTimeInput(item.endTime),
        })) ?? [],
    [record],
  );
  const [date, setDate] = useState(record?.date ?? new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [breaks, setBreaks] = useState<DraftBreak[]>(initialBreaks);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!startTime || !endTime) return null;
    try {
      const work = workDateTimes(date, startTime, endTime);
      return calculateDailySummary({
        workDate: date,
        startTime: work.start,
        endTime: work.end,
        normalWorkingMinutes: normalWorkingHours * 60,
        extraHoursSettings,
        breaks: breaks
          .filter((item) => item.startTime && item.endTime)
          .map((item) => {
            const breakTime = breakDateTimes(date, work.start, item.startTime, item.endTime);
            return { startTime: breakTime.start, endTime: breakTime.end };
          }),
      });
    } catch {
      return null;
    }
  }, [breaks, date, endTime, extraHoursSettings, normalWorkingHours, startTime]);

  async function submit(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      const work = workDateTimes(date, startTime, endTime);
      const payload = {
        date: String(formData.get("date")),
        startTime: work.start.toISOString(),
        endTime: work.end?.toISOString() ?? null,
        breaks: breaks
          .filter((item) => item.startTime && item.endTime)
          .map((item) => {
            const breakTime = breakDateTimes(date, work.start, item.startTime, item.endTime);
            return {
              startTime: breakTime.start.toISOString(),
              endTime: breakTime.end.toISOString(),
            };
          }),
      };

      await requestJson(record ? `/api/work-days/${record.id}` : "/api/work-days?mode=manual", {
        method: record ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      await onSaved();
      onCancel?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save this record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={submit} className="theme-scrollbar group/card relative grid max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto overscroll-contain rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6 shadow-[var(--soft-shadow)] backdrop-blur-sm sm:p-7">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-500 group-hover/card:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in_srgb,var(--gradient-start)_26%,transparent), color-mix(in_srgb,var(--gradient-mid)_16%,transparent) 48%, color-mix(in_srgb,var(--gradient-end)_22%,transparent))",
        }}
      />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{record ? "Edit record" : "Add record"}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Choose the date once, then enter only times for work and breaks.</p>
        </div>
        {onCancel ? (
          <Button type="button" variant="ghost" className="h-12 w-12 shrink-0 px-0" onClick={onCancel} aria-label="Close">
            <X size={24} strokeWidth={1.7} />
          </Button>
        ) : null}
      </div>
      <div className="relative z-10 grid gap-4 sm:grid-cols-[1.1fr_1fr_1fr]">
        <Field label="Date">
          <Input name="date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field label="Start work">
          <Input
            name="startTime"
            type="time"
            step={1}
            required
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </Field>
        <Field label="End work">
          <Input
            name="endTime"
            type="time"
            step={1}
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </Field>
      </div>
      <div className="relative z-10 grid gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--foreground)]">Breaks</p>
          <Button
            type="button"
            variant="secondary"
            className="h-12 px-4"
            icon={<Plus size={24} strokeWidth={1.7} />}
            onClick={() => setBreaks((items) => [...items, { tempId: crypto.randomUUID(), startTime: "", endTime: "" }])}
          >
            Add Break
          </Button>
        </div>
        {breaks.map((item, index) => (
          <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] p-3 shadow-[var(--shadow-card)] sm:grid-cols-[auto_1fr_1fr_auto]" key={item.tempId}>
            <div className="self-center text-sm font-semibold text-[var(--muted)]">Break {index + 1}</div>
            <Field label="Start">
              <Input
                aria-label={`Break ${index + 1} start time`}
                type="time"
                step={1}
                value={item.startTime}
                onChange={(event) =>
                  setBreaks((items) => items.map((breakItem) => (breakItem.tempId === item.tempId ? { ...breakItem, startTime: event.target.value } : breakItem)))
                }
              />
            </Field>
            <Field label="End">
              <Input
                aria-label={`Break ${index + 1} end time`}
                type="time"
                step={1}
                value={item.endTime}
                onChange={(event) =>
                  setBreaks((items) => items.map((breakItem) => (breakItem.tempId === item.tempId ? { ...breakItem, endTime: event.target.value } : breakItem)))
                }
              />
            </Field>
            <Button type="button" variant="ghost" className="h-11 w-11 px-0" onClick={() => setBreaks((items) => items.filter((breakItem) => breakItem.tempId !== item.tempId))} aria-label="Remove break">
              <Trash2 size={24} strokeWidth={1.7} />
            </Button>
          </div>
        ))}
      </div>
      <div className="relative z-10 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] p-4 shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold text-[var(--foreground)]">Calculated Summary</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          {[
            ["Elapsed", preview ? formatMinutes(preview.elapsedMinutes) : "0h 0m"],
            ["Break", preview ? formatMinutes(preview.breakMinutes) : "0h 0m"],
            ["Working", preview ? formatMinutes(preview.actualWorkingMinutes) : "0h 0m"],
            ["Target", formatMinutes(normalWorkingHours * 60)],
            ["Extra", preview ? `+${formatMinutes(preview.extraMinutes)}` : "+0h 0m"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-medium uppercase text-[var(--subtle)]">{label}</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{value}</p>
            </div>
          ))}
        </div>
      </div>
      {error ? (
        <p className="relative z-10 rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      <div className="relative z-10 flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button variant="accent" disabled={saving} icon={<Save size={24} strokeWidth={1.7} />}>
          {saving ? "Saving..." : "Save Record"}
        </Button>
      </div>
    </form>
  );
}
