import { redirect } from "next/navigation";
import AdminPage from "@/views/Admin";
import { getServerAuthSession } from "@/lib/auth";

export default async function Page() {
  const session = await getServerAuthSession();

  if (!session?.isAdmin) {
    redirect("/admin/login");
  }

  return <AdminPage initialSession={session} />;
}
