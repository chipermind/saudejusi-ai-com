import { createFileRoute, redirect } from "@tanstack/react-router";

// Temporary 301 redirect: while the beta is closed, /signup forwards to /waitlist.
// When public signup opens, replace this file with the real registration page
// (auth + firm creation) and keep `/waitlist` as a separate, archived route.
export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({ to: "/waitlist", code: 301 });
  },
});
