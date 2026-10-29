export const canUseDOM = !!(typeof window !== "undefined" && window.document?.createElement);
