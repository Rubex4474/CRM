import { Logo } from "@/components/branding/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4 h-16 w-16 text-2xl font-bold" />
          <h1 className="font-heading text-2xl font-bold tracking-tight">Stockmann CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre com seu e-mail e senha.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
