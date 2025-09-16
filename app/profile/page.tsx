import { redirect } from "next/navigation";
import { getServerSession } from "../../lib/supabase/server";
import { getUserProfile } from "../../lib/supabase/profile-queries";
import { ProfileForm } from "../../components/profile/profile-form";
import { SiteHeader } from "../../components/site-header";

export default async function ProfilePage() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">
              Update your profile information and preferences.
            </p>
          </div>
          
          <ProfileForm profile={profile} />
        </div>
      </main>
    </div>
  );
}
