import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: () => (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-semibold text-foreground">대시보드 (준비 중)</h1>
    </main>
  ),
});