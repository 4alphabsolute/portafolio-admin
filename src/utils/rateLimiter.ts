/**
 * Simple client-side rate limiter using localStorage.
 * Prevents API abuse by enforcing a cooldown period between requests.
 */
export const checkRateLimit = (featureId: string, cooldownSeconds: number = 60): { allowed: boolean; waitTime?: number } => {
    const key = `rate_limit_${featureId}`;
    const lastRequest = localStorage.getItem(key);
    const now = Date.now();

    if (lastRequest) {
        const lastTime = parseInt(lastRequest, 10);
        const elapsedSeconds = (now - lastTime) / 1000;

        if (elapsedSeconds < cooldownSeconds) {
            return {
                allowed: false,
                waitTime: Math.ceil(cooldownSeconds - elapsedSeconds)
            };
        }
    }

    // Update timestamp
    localStorage.setItem(key, now.toString());
    return { allowed: true };
};
