import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/habits")({
  component: () => (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-semibold text-foreground">습관 (준비 중)</h1>
    </main>
  ),
});