"use server";

import { createSupabaseServerClient } from "../../lib/supabase/server";
import { createUserProfile } from "../../lib/supabase/profile-queries";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure user has a profile (for existing users who signed up before this feature)
  if (data.user) {
    try {
      const { createUserProfile } = await import("../../lib/supabase/profile-queries");
      await createUserProfile(data.user.id, email);
      console.log("Profile ensured for user:", data.user.id);
    } catch (profileError) {
      console.error("Failed to ensure profile:", profileError);
      // Don't fail the signin if profile creation fails
    }
  }

  redirect("/dashboard");
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Create user profile after successful signup
  if (data.user) {
    try {
      await createUserProfile(data.user.id, email);
      console.log("Profile created for user:", data.user.id);
    } catch (profileError) {
      console.error("Failed to create profile:", profileError);
      // Don't fail the signup if profile creation fails
      // The user can still sign in and we can handle this later
    }
  }

  redirect("/dashboard");
}


