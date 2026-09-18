import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading text-xl font-bold">
            SC
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">CRM Agência</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre com seu e-mail e senha.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
