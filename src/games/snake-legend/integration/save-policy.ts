// Keep the preview usable on cold Edge requests and slower mobile networks.
// Requests remain cancellable; no polling or automatic replay retries are added.
export const SNAKE_SAVE_TIMEOUT_MS=30_000;
