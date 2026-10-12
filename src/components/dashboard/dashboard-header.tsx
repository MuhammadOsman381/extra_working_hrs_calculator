import { Clock3, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/src/components/theme/theme-provider";
import { Button } from "@/src/components/ui/button";
import { requestJson } from "@/src/lib/client-api";
import type { AppUser } from "@/src/features/work-days/types";

export function DashboardHeader({
  user,
  onOpenSettings,
}: {
  user: AppUser;
  onOpenSettings: () => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  async function logout() {
    setLoggingOut(true);
    await requestJson("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] shadow-sm">
            <Clock3 size={26} strokeWidth={1.7} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold text-[var(--foreground)]">Extra Hours</h1>
              <span className="hidden rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] font-medium text-[var(--subtle)] sm:inline">
                {user.dailyWorkingHours}h target
              </span>
            </div>
            <p className="hidden text-xs font-medium text-[var(--muted)] sm:block">Track your time. Own your overtime.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-11 px-0"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Moon size={24} strokeWidth={1.7} /> : <Sun size={24} strokeWidth={1.7} />}
          </Button>
          <Button type="button" variant="secondary" className="h-11 px-3" onClick={onOpenSettings} icon={<Settings size={24} strokeWidth={1.7} />}>
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <div className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 sm:flex">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-28 truncate text-sm font-medium text-[var(--foreground)]">{user.name}</span>
          </div>
          <Button variant="ghost" className="h-11 px-3" onClick={logout} disabled={loggingOut} icon={<LogOut size={24} strokeWidth={1.7} />}>
            <span className="hidden sm:inline">{loggingOut ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
