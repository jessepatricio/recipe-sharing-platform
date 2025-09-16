import { createSupabaseServerClient } from "./server";

export async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...");
    const supabase = await createSupabaseServerClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from("recipes")
      .select("count")
      .limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    
    console.log("Supabase connection test successful");
    return {
      success: true,
      data: data
    };
  } catch (err) {
    console.error("Unexpected error testing Supabase connection:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}
