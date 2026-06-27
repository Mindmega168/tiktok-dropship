import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminSidebar from "@/components/AdminSidebar";

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const token = await getAdminToken();

  if (!token) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30 md:pl-64">
      <AdminSidebar />
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
