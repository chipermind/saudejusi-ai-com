import { createFileRoute, redirect } from "@tanstack/react-router";

// /demo is the legacy CTA destination. Consolidated into /waitlist.
// 301 redirect — permanent move.
export const Route = createFileRoute("/demo")({
  beforeLoad: () => {
    throw redirect({ to: "/waitlist", code: 301 });
  },
});
