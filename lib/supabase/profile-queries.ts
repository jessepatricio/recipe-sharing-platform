import { createSupabaseServerClient } from "./server";
import { Profile } from "../types";

export async function createUserProfile(userId: string, email: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      console.log("Profile already exists for user:", userId);
      return existingProfile;
    }
    
    // Extract username from email (part before @)
    const username = email.split('@')[0];
    
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username: username,
        full_name: username, // Use username as default full name
        bio: null, // Bio field, nullable
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    console.log("Profile created successfully:", data);
    return data;
  } catch (err) {
    console.error("Unexpected error creating profile:", err);
    throw new Error(`Failed to create profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error("Error fetching profile:", err);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: { username?: string; full_name?: string; bio?: string }) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error updating profile:", err);
    throw new Error(`Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}
