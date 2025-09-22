import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "../lib/supabase/server";
import { signOut } from "../app/actions/auth";
import { getUserProfile } from "../lib/supabase/profile-queries";

export async function SiteHeader() {
  const session = await getServerSession();
  const user = session?.user ?? null;
  
  // Fetch user profile to get full name
  let userProfile = null;
  if (user?.id) {
    userProfile = await getUserProfile(user.id);
  }
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
        <div className="flex items-center gap-2">
          <div className="h-28 w-28 rounded bg-primary/10 flex items-center justify-center">
            <Image
              src="/jdp-logo.svg"
              alt="Recipe Sharing Platform Logo"
              width={111}
              height={111}
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">Recipe Sharing Platform</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {userProfile?.full_name || userProfile?.username || user.email}
                </span>
                <Link href="/dashboard" className="hover:underline underline-offset-4">Dashboard</Link>
                <Link href="/my-recipes" className="hover:underline underline-offset-4">My Recipes</Link>
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
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">
                  {userProfile?.full_name || userProfile?.username || user.email}
                </span>
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="text-sm hover:underline underline-offset-4">Dashboard</Link>
                  <Link href="/my-recipes" className="text-sm hover:underline underline-offset-4">My Recipes</Link>
                  <Link href="/profile" className="text-sm hover:underline underline-offset-4">Profile</Link>
                  <form action={signOut}>
                    <button className="text-sm rounded-md border border-black/10 dark:border-white/15 px-2 py-1 hover:bg-foreground/5">
                      Sign out
                    </button>
                  </form>
                </div>
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


