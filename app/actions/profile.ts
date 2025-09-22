"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "../../lib/supabase/server";
import { updateUserProfile } from "../../lib/supabase/profile-queries";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  const username = formData.get("username") as string;
  const full_name = formData.get("full_name") as string;
  const bio = formData.get("bio") as string;

  // Basic validation
  if (!username || !full_name) {
    return {
      success: false,
      error: "Username and full name are required"
    };
  }

  if (username.length < 3) {
    return {
      success: false,
      error: "Username must be at least 3 characters long"
    };
  }

  try {
    await updateUserProfile(session.user.id, {
      username: username.trim(),
      full_name: full_name.trim(),
      bio: bio?.trim() || undefined
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile"
    };
  }
}

