"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LayoutGrid, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkspaceTabs({ clienteId }: { clienteId: string }) {
  const pathname = usePathname();
  const base = `/workspace/${clienteId}`;

  const tabs = [
    { href: base, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `${base}/kanban`, label: "Kanban", icon: LayoutGrid, exact: false },
    { href: `${base}/tarefas`, label: "Tarefas", icon: ListChecks, exact: false },
  ];

  return (
    <nav className="flex gap-1 border-b border-border bg-card px-6">
      {tabs.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
