import Image from "next/image";
import { SiteHeader } from "../components/site-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Discover, cook, and share your favorite recipes
              </h1>
              <p className="mt-4 text-base sm:text-lg text-foreground/70">
                A clean and simple place to collect your best dishes and find new
                inspiration from others. Supabase integration is coming next.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="#recipes"
                  className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90 transition"
                >
                  Explore recipes
                </a>
                <a
                  href="#cta"
                  className="inline-flex items-center justify-center rounded-md border border-black/10 dark:border-white/15 px-5 py-3 text-sm font-medium hover:bg-foreground/5 transition"
                >
                  Share a recipe
                </a>
              </div>
            </div>
            <div className="relative h-56 sm:h-64 md:h-80 rounded-xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-foreground/5 to-transparent overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-2 opacity-90">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="rounded-lg bg-background/70 border border-black/5 dark:border-white/5" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-10 sm:py-14 border-t border-black/10 dark:border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Save your favorites",
                desc: "Bookmark recipes you love and organize your collection.",
                icon: "/file.svg",
              },
              {
                title: "Discover new dishes",
                desc: "Browse community picks and trending meals.",
                icon: "/globe.svg",
              },
              {
                title: "Simple & fast",
                desc: "Clean interface focused on cooking, not clutter.",
                icon: "/window.svg",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-black/10 dark:border-white/10 p-5 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <Image src={item.icon} alt="" width={18} height={18} aria-hidden />
                  <h3 className="text-base font-semibold">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm text-foreground/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="recipes" className="py-10 sm:py-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Popular recipes</h2>
            <a href="#" className="text-sm hover:underline underline-offset-4">View all</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Creamy Pesto Pasta", "Classic Shakshuka", "Garlic Butter Salmon"].map(
              (name, i) => (
                <article
                  key={i}
                  className="group rounded-xl border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-sm transition"
                >
                  <div className="h-40 bg-foreground/10" />
                  <div className="p-4">
                    <h3 className="font-medium">{name}</h3>
                    <p className="mt-1 text-sm text-foreground/70">
                      A short description about this delicious dish.
                    </p>
                    <div className="mt-3 text-xs text-foreground/60">15 mins · Easy</div>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        <section id="cta" className="py-12 sm:py-16">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Start your cookbook</h3>
              <p className="mt-2 text-sm text-foreground/70">
                Create an account to save recipes and share your own. Supabase auth
                and database are up next.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Create free account
            </a>
          </div>
        </section>
      </main>

      <footer className="mt-8 border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-foreground/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Recipe Sharing Platform</span>
          <span>Built with Next.js 15 & Tailwind</span>
        </div>
      </footer>
    </div>
  );
}
