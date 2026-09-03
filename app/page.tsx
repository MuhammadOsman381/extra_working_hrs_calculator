import { redirect } from "next/navigation";
import { getSession } from "@/src/features/auth/services/auth-service";

export default async function Home() {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
