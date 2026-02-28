const rateLimits = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const lastRequest = rateLimits.get(ip) || 0;
    if (now - lastRequest < RATE_LIMIT_WINDOW) {
        return false;
    }
    rateLimits.set(ip, now);
    return true;
}
