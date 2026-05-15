/** LocalStorage key used to track how many times the user has visited */
export const VISIT_COUNT_KEY = "zenticare_pwa_visit_count";

/** LocalStorage key used to track if the user dismissed the install prompt */
export const PROMPT_DISMISSED_KEY = "zenticare_pwa_prompt_dismissed";

/** LocalStorage key to track when the prompt was last dismissed (timestamp) */
export const PROMPT_DISMISSED_AT_KEY = "zenticare_pwa_prompt_dismissed_at";

/** Show the install prompt on the 1st and 2nd visit */
export const MAX_PROMPT_VISITS = 2;

/** Cooldown period after dismissal before showing again (7 days in ms) */
export const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
