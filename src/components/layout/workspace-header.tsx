import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

export function WorkspaceHeader({
  clienteNome,
  isAdmin,
}: {
  clienteNome: string;
  isAdmin: boolean;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          <h1 className="font-heading text-lg font-bold leading-tight">{clienteNome}</h1>
        </div>
      </div>
      {!isAdmin && (
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      )}
    </header>
  );
}
