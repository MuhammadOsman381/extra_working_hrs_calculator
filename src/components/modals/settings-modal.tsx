"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Save, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/src/components/theme/theme-provider";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/input";
import type { AppUser } from "@/src/features/work-days/types";

export function SettingsModal({
  open,
  user,
  onClose,
  onSaveSettings,
}: {
  open: boolean;
  user: AppUser;
  onClose: () => void;
  onSaveSettings: (dailyWorkingHours: number) => Promise<void>;
}) {
  const { theme, setTheme } = useTheme();
  const [hours, setHours] = useState(user.dailyWorkingHours);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => setHours(user.dailyWorkingHours));
  }, [user.dailyWorkingHours]);

  async function save() {
    setSaving(true);
    await onSaveSettings(hours);
    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="settings-title" className="text-xl font-semibold text-[var(--foreground)]">
                  Settings
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
              </div>
              <Button type="button" variant="ghost" className="h-9 w-9 px-0" onClick={onClose} aria-label="Close settings">
                <X size={16} />
              </Button>
            </div>

            <div className="mt-6 grid gap-6">
              <Field label="Normal working hours">
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={hours}
                    onChange={(event) => setHours(Number(event.target.value))}
                  />
                  <span className="text-sm font-medium text-[var(--muted)]">hours per day</span>
                </div>
              </Field>

              <div className="grid gap-2">
                <p className="text-sm font-medium text-[var(--muted)]">Theme</p>
                <div className="grid grid-cols-3 gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-1">
                  {[
                    { value: "dark" as const, label: "Dark", icon: Moon },
                    { value: "light" as const, label: "Light", icon: Sun },
                    { value: "system" as const, label: "System", icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.value}
                        onClick={() => setTheme(item.value)}
                        className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                          theme === item.value
                            ? "bg-[var(--accent)] text-zinc-950"
                            : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <Icon size={15} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Account settings are scoped to your secure session.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="accent" onClick={save} disabled={saving} icon={<Save size={16} />}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
