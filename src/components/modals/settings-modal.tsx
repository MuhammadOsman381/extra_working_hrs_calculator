"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, Clock, Monitor, Moon, Palette, Save, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTheme } from "@/src/components/theme/theme-provider";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Field, Input } from "@/src/components/ui/input";
import type { AppUser } from "@/src/features/work-days/types";
import type { SettingsUpdate } from "@/src/hooks/use-dashboard-data";
import { palettes } from "@/src/lib/palettes";

type ToggleKey = Exclude<keyof SettingsUpdate, "dailyWorkingHours" | "theme" | "palette">;
type WeekendSettings = Omit<SettingsUpdate, "dailyWorkingHours" | "theme" | "palette">;

function SwitchRow({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group flex w-full items-center justify-between gap-4 rounded-md py-3 text-left transition ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--foreground)]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{description}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition group-focus-visible:ring-4 group-focus-visible:ring-[var(--accent-soft)] ${
          checked ? "bg-[var(--accent)]" : "bg-[var(--surface-muted)]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function SettingSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card as="section" className="p-4 sm:p-5" interactive={false}>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-soft)] via-[var(--surface)] to-[color-mix(in_srgb,var(--accent-2)_14%,transparent)] text-[var(--accent)] shadow-[var(--shadow-card)]">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

function PalettePanel({
  activePalette,
  onSelect,
}: {
  activePalette: string;
  onSelect: (paletteId: (typeof palettes)[number]["id"]) => void;
}) {
  const currentPalette = palettes.find((item) => item.id === activePalette) ?? palettes[0];

  return (
    <div className="flex h-[min(22rem,calc(100dvh-12rem))] min-h-0 flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--soft-shadow)]">
      <div className="shrink-0 border-b border-[var(--border)] px-3 py-3">
        <p className="text-sm font-black text-[var(--foreground)]">Color theme</p>
        <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{currentPalette.name}</p>
      </div>
      <div className="theme-scrollbar min-h-0 flex-1 grid gap-1 overflow-y-scroll overscroll-contain p-1">
        {palettes.map((item) => {
          const active = activePalette === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[var(--background)] ${
                active ? "bg-[var(--background)]" : ""
              }`}
            >
              <span
                className="h-12 w-20 shrink-0 rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]"
                style={{
                  background: `linear-gradient(135deg, ${item.colors.join(", ")})`,
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-[var(--foreground)]">{item.name}</span>
                <span className="block truncate text-xs font-semibold text-[var(--muted)]">{item.vibe}</span>
              </span>
              {active ? <Check className="h-6 w-6 shrink-0 text-[var(--accent)]" strokeWidth={2} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModePanel({
  theme,
  onSelect,
}: {
  theme: "dark" | "light" | "system";
  onSelect: (theme: "dark" | "light" | "system") => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--soft-shadow)]">
      <div className="border-b border-[var(--border)] px-3 py-3">
        <p className="text-sm font-black text-[var(--foreground)]">Display mode</p>
        <p className="mt-1 text-xs font-semibold capitalize text-[var(--muted)]">{theme}</p>
      </div>
      <div className="grid gap-1 p-1 min-[520px]:grid-cols-3">
        {[
          { value: "dark" as const, label: "Dark", vibe: "Low-light focus", icon: Moon },
          { value: "light" as const, label: "Light", vibe: "Bright workspace", icon: Sun },
          { value: "system" as const, label: "System", vibe: "Match device", icon: Monitor },
        ].map((item) => {
          const Icon = item.icon;
          const active = theme === item.value;
          return (
            <button
              type="button"
              key={item.value}
              onClick={() => onSelect(item.value)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[var(--background)] ${
                active ? "bg-[var(--background)]" : ""
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--accent)] shadow-[var(--shadow-card)]">
                <Icon size={28} strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-[var(--foreground)]">{item.label}</span>
                <span className="block truncate text-xs font-semibold text-[var(--muted)]">{item.vibe}</span>
              </span>
              {active ? <Check className="h-6 w-6 shrink-0 text-[var(--accent)]" strokeWidth={2} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsModal({
  open,
  user,
  onClose,
  onSaveSettings,
}: {
  open: boolean;
  user: AppUser;
  onClose: () => void;
  onSaveSettings: (settings: SettingsUpdate) => Promise<void>;
}) {
  const { theme, palette, setTheme, setPalette } = useTheme();
  const [hours, setHours] = useState(user.dailyWorkingHours);
  const [weekendSettings, setWeekendSettings] = useState<WeekendSettings>({
    countSaturdayAsExtraHours: user.countSaturdayAsExtraHours,
    countSaturdayAsDoubleExtraHours: user.countSaturdayAsDoubleExtraHours,
    countSundayAsExtraHours: user.countSundayAsExtraHours,
    countSundayAsDoubleExtraHours: user.countSundayAsDoubleExtraHours,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setHours(user.dailyWorkingHours);
      setWeekendSettings({
        countSaturdayAsExtraHours: user.countSaturdayAsExtraHours,
        countSaturdayAsDoubleExtraHours: user.countSaturdayAsDoubleExtraHours,
        countSundayAsExtraHours: user.countSundayAsExtraHours,
        countSundayAsDoubleExtraHours: user.countSundayAsDoubleExtraHours,
      });
    });
  }, [
    user.countSaturdayAsDoubleExtraHours,
    user.countSaturdayAsExtraHours,
    user.countSundayAsDoubleExtraHours,
    user.countSundayAsExtraHours,
    user.dailyWorkingHours,
  ]);

  function setToggle(key: ToggleKey, checked: boolean) {
    setWeekendSettings((settings) => {
      if (key === "countSaturdayAsExtraHours" && !checked) {
        return { ...settings, countSaturdayAsExtraHours: false, countSaturdayAsDoubleExtraHours: false };
      }
      if (key === "countSundayAsExtraHours" && !checked) {
        return { ...settings, countSundayAsExtraHours: false, countSundayAsDoubleExtraHours: false };
      }
      if (key === "countSaturdayAsDoubleExtraHours" && checked) {
        return { ...settings, countSaturdayAsExtraHours: true, countSaturdayAsDoubleExtraHours: true };
      }
      if (key === "countSundayAsDoubleExtraHours" && checked) {
        return { ...settings, countSundayAsExtraHours: true, countSundayAsDoubleExtraHours: true };
      }
      return { ...settings, [key]: checked };
    });
  }

  async function save() {
    setSaving(true);
    try {
      await onSaveSettings({ dailyWorkingHours: hours, ...weekendSettings, theme, palette });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-3 backdrop-blur-sm sm:p-4"
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
            className="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] shadow-[var(--soft-shadow)] backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h2 id="settings-title" className="text-xl font-semibold text-[var(--foreground)]">
                  Settings
                </h2>
                <p className="mt-1 break-all text-sm text-[var(--muted)]">{user.email}</p>
              </div>
              <Button type="button" variant="ghost" className="h-10 w-10 px-0" onClick={onClose} aria-label="Close settings">
                <X size={20} strokeWidth={1.8} />
              </Button>
            </div>

            <div className="min-h-0 flex-1 grid gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:gap-5 sm:px-5">
              <SettingSection title="Working Hours" icon={<Clock size={24} strokeWidth={1.7} />}>
                <Field label="Normal working hours">
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
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
              </SettingSection>

              <SettingSection title="Weekend Extra Hours" icon={<CalendarDays size={24} strokeWidth={1.7} />}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-3 shadow-[var(--shadow-card)]">
                    <SwitchRow
                      label="Saturday extra"
                      description="Count all Saturday working time as extra."
                      checked={weekendSettings.countSaturdayAsExtraHours}
                      onChange={(checked) => setToggle("countSaturdayAsExtraHours", checked)}
                    />
                    <div className="border-t border-[var(--border)]" />
                    <SwitchRow
                      label="Double Saturday"
                      description="Multiply Saturday extra time by 2."
                      checked={weekendSettings.countSaturdayAsDoubleExtraHours}
                      disabled={!weekendSettings.countSaturdayAsExtraHours}
                      onChange={(checked) => setToggle("countSaturdayAsDoubleExtraHours", checked)}
                    />
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-3 shadow-[var(--shadow-card)]">
                    <SwitchRow
                      label="Sunday extra"
                      description="Count all Sunday working time as extra."
                      checked={weekendSettings.countSundayAsExtraHours}
                      onChange={(checked) => setToggle("countSundayAsExtraHours", checked)}
                    />
                    <div className="border-t border-[var(--border)]" />
                    <SwitchRow
                      label="Double Sunday"
                      description="Multiply Sunday extra time by 2."
                      checked={weekendSettings.countSundayAsDoubleExtraHours}
                      disabled={!weekendSettings.countSundayAsExtraHours}
                      onChange={(checked) => setToggle("countSundayAsDoubleExtraHours", checked)}
                    />
                  </div>
                </div>
              </SettingSection>

              <SettingSection title="Theme" icon={<Palette size={24} strokeWidth={1.7} />}>
                <div className="grid gap-4">
                  <ModePanel theme={theme} onSelect={setTheme} />
                  <PalettePanel activePalette={palette} onSelect={setPalette} />
                </div>
              </SettingSection>

              <Card className="p-4" interactive={false}>
                <p className="break-words text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Account settings are scoped to your secure session.</p>
              </Card>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
              <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="accent" className="w-full sm:w-auto" onClick={save} disabled={saving} icon={<Save size={20} strokeWidth={1.8} />}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
