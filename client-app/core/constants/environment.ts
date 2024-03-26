export const IS_DEVELOPMENT = import.meta.env.MODE === "development";
/** @deprecated use canUseDOM */
export const IS_CLIENT = typeof window !== "undefined";
