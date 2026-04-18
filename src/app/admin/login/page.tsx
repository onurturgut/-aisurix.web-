import { redirect } from "next/navigation";
import AdminLoginPage from "@/views/AdminLogin";
import { getServerAuthSession } from "@/lib/auth";

export default async function Page() {
  const session = await getServerAuthSession();

  if (session?.isAdmin) {
    redirect("/admin");
  }

  return <AdminLoginPage initialSession={session} />;
}
