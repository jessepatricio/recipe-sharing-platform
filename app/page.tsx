import Link from "next/link";
import { SiteHeader } from "../components/site-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6">
        <section className="py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Start sharing your recipes
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto">
              Join our community of food lovers. Discover amazing recipes, save your favorites, and share your own culinary creations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-8 py-4 text-lg font-medium hover:opacity-90 transition"
              >
                Create free account
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-md border border-black/10 dark:border-white/15 px-8 py-4 text-lg font-medium hover:bg-foreground/5 transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Why join our community?
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Get access to amazing features that make cooking and sharing recipes effortless.
            </p>
          </div>
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
                className="rounded-xl border border-black/10 dark:border-white/10 p-6 hover:shadow-sm transition text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <img src={item.icon} alt="" width={20} height={20} aria-hidden />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-foreground/70">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-6 py-3 text-base font-medium hover:opacity-90 transition"
            >
              Get started today
            </Link>
          </div>
        </section>


        <section id="cta" className="py-16 sm:py-20">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 p-8 sm:p-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to start cooking?</h3>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join thousands of home cooks who are already sharing their favorite recipes and discovering new ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-8 py-4 text-lg font-medium hover:opacity-90 transition"
              >
                Create free account
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-md border border-black/10 dark:border-white/15 px-8 py-4 text-lg font-medium hover:bg-foreground/5 transition"
              >
                Sign in
              </Link>
            </div>
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
