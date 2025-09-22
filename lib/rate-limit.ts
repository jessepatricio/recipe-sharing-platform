// Rate limiting utilities for protecting the database
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest) => {
    const key = config.keyGenerator ? config.keyGenerator(req) : getClientIP(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    const current = rateLimitStore.get(key);
    
    if (!current || current.resetTime < now) {
      // New window or expired
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
      return { success: true, remaining: config.maxRequests - 1 };
    }
    
    if (current.count >= config.maxRequests) {
      return { 
        success: false, 
        remaining: 0, 
        resetTime: current.resetTime,
        error: 'Rate limit exceeded'
      };
    }
    
    current.count++;
    return { success: true, remaining: config.maxRequests - current.count };
  };
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Demo-specific rate limits
export const demoRateLimits = {
  // Very restrictive for demo
  recipeCreation: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 2, // Only 2 recipes per minute
    keyGenerator: (req) => `recipe-create-${getClientIP(req)}`
  }),
  
  recipeUpdate: rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    maxRequests: 3, // 3 updates per 30 seconds
    keyGenerator: (req) => `recipe-update-${getClientIP(req)}`
  }),
  
  likeAction: rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    maxRequests: 5, // 5 likes per 10 seconds
    keyGenerator: (req) => `like-${getClientIP(req)}`
  }),
  
  commentAction: rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    maxRequests: 3, // 3 comments per 30 seconds
    keyGenerator: (req) => `comment-${getClientIP(req)}`
  }),
  
  imageUpload: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1, // Only 1 image upload per minute
    keyGenerator: (req) => `image-upload-${getClientIP(req)}`
  })
};
