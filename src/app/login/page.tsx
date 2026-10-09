import { Logo } from "@/components/branding/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]"
      />
      <div className="relative w-full max-w-[22rem]">
        <div className="mb-9 flex flex-col items-center text-center">
          <Logo className="mb-5 h-14 w-14 text-xl font-bold" />
          <h1 className="font-heading text-xl font-bold tracking-tight">Stockmann CRM</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Entre com seu e-mail e senha.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
