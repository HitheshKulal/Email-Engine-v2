export class RateLimiter {
    private requestCount: number;
    private maxRequests: number;
    private timeWindow: number;
    private firstRequestTimestamp: number | null;

    constructor(maxRequests: number, timeWindowInMinutes: number) {
        this.requestCount = 0;
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindowInMinutes * 60 * 1000; // Convert minutes to milliseconds
        this.firstRequestTimestamp = null;
    }

    public checkLimit(): boolean {
        const currentTime = Date.now();

        if (this.firstRequestTimestamp === null) {
            this.firstRequestTimestamp = currentTime;
        }

        const timeElapsed = currentTime - this.firstRequestTimestamp;

        if (timeElapsed > this.timeWindow) {
            this.requestCount = 1;
            this.firstRequestTimestamp = currentTime;
            return true;
        }

        if (this.requestCount >= this.maxRequests) {
            return false;
        }

        this.requestCount += 1;
        return true;
    }
}
