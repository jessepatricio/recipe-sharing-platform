import { AuthForm } from "../../components/auth/auth-form";
import { SiteHeader } from "../../components/site-header";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">Sign in</h1>
        <AuthForm mode="sign-in" />
      </main>
    </div>
  );
}


