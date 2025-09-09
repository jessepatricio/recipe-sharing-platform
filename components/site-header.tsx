import Image from "next/image";

export function SiteHeader() {
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
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:underline underline-offset-4">Features</a>
          <a href="#recipes" className="hover:underline underline-offset-4">Popular</a>
          <a href="#cta" className="hover:underline underline-offset-4">Get Started</a>
        </nav>
      </div>
    </header>
  );
}


