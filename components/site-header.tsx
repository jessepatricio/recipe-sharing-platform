import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "../lib/supabase/server";
import { signOut } from "../app/actions/auth";

export async function SiteHeader() {
  const session = await getServerSession();
  const user = session?.user ?? null;
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Logo"
              width={24}
              height={24}
              priority
            />
          </div>
          <span className="text-base font-semibold tracking-tight">Recipe Sharing Platform</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <div className="hidden sm:flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard" className="hover:underline underline-offset-4">Dashboard</Link>
                <Link href="/profile" className="hover:underline underline-offset-4">Profile</Link>
                <form action={signOut}>
                  <button className="rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5 hover:bg-foreground/5">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <a href="#features" className="hover:underline underline-offset-4">Features</a>
                <a href="#cta" className="hover:underline underline-offset-4">Get Started</a>
                <Link href="/sign-in" className="rounded-md bg-foreground text-background px-3 py-1.5">Sign in</Link>
              </>
            )}
          </div>
          
          {/* Mobile menu */}
          <div className="sm:hidden">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-sm hover:underline underline-offset-4">Dashboard</Link>
                <Link href="/profile" className="text-sm hover:underline underline-offset-4">Profile</Link>
                <form action={signOut}>
                  <button className="text-sm rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-foreground/5">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/sign-in" className="rounded-md bg-foreground text-background px-3 py-1.5 text-sm">Sign in</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}


