export const DEBUG_PREFIX = "[PostHog]";

export const MODULE_ID = "VirtoCommerce.PostHog";

export const POSTHOG_SETTINGS_MAPPING = {
  "PostHog.EnableTracking": "isEnabled",
  "PostHog.ProjectToken": "projectToken",
  "PostHog.ApiHost": "apiHost",
  "PostHog.Autocapture": "isAutocaptureEnabled",
  "PostHog.SessionRecording": "isSessionRecordingEnabled",
} as const;

export const TRACKER_NAME = "posthog";

export const DEFAULT_API_HOST = "https://us.i.posthog.com";

export const PENDING_LOGIN_STORAGE_KEY = "vc-posthog-pending-login";

/** The PostHog group type an organization's events are attached to; the backend module uses the same name. */
export const ORGANIZATION_GROUP_TYPE = "organization";

/** Set while a person is identified, so a signed-out boot knows the SDK persistence still holds one. */
export const IDENTIFIED_STORAGE_KEY = "vc-posthog-identified";
