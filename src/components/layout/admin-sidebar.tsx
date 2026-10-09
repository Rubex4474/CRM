"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Target, ListTodo, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { Logo } from "@/components/branding/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/meus-leads", label: "Meus leads", icon: Target },
  { href: "/admin/tarefas", label: "Tarefas da agência", icon: ListTodo },
];

export function AdminSidebar({ nome }: { nome: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <Logo className="h-7 w-7 shrink-0 text-sm font-bold" />
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-bold leading-tight">Stockmann CRM</p>
          <p className="truncate text-xs text-muted-foreground">{nome}</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-md py-2 pl-4 pr-3 text-sm transition-colors",
                active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="border-t border-border p-2">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Sair
        </button>
      </form>
    </aside>
  );
}
