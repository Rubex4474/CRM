import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessao = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar nome={sessao.nome} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
