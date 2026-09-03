import { redirect } from "next/navigation";
import { DashboardClient } from "@/src/components/dashboard/dashboard-client";
import { requireUser } from "@/src/features/auth/services/auth-service";

export default async function DashboardPage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }
  return <DashboardClient user={user} />;
}
