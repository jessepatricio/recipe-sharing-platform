import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { demoRateLimits } from "./lib/rate-limit";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Demo-specific headers
  response.headers.set('X-Demo-Mode', 'true');
  response.headers.set('X-Rate-Limit-Info', 'This is a demo with restricted usage');

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResult = demoRateLimits.recipeCreation(request);
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          message: 'Demo mode: Too many requests. Please wait before trying again.',
          retryAfter: Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '2',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime!.toString()
          }
        }
      );
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  await supabase.auth.getSession();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$).*)",
  ],
};


