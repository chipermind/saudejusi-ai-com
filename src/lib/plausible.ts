// Lightweight Plausible analytics helper.
// The script itself is loaded in src/routes/__root.tsx.
// All event names and props are aggregated metadata only — never PII.

type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: PlausibleProps; callback?: () => void },
    ) => void;
  }
}

export function trackEvent(event: string, props?: PlausibleProps) {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Never let analytics break the UI.
  }
}

export type CtaLocation =
  | "header"
  | "hero"
  | "pricing_livre"
  | "pricing_essencial"
  | "pricing_familia";
