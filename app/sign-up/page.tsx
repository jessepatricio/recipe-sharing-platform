import { AuthForm } from "../../components/auth/auth-form";
import { SiteHeader } from "../../components/site-header";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">Create account</h1>
        <p className="text-sm text-foreground/70 mb-6">Use email and password to create your account.</p>
        <AuthForm mode="sign-up" />
      </main>
    </div>
  );
}


