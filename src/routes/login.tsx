import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <p className="text-muted-foreground">로그인 페이지 (준비 중)</p>
    </main>
  );
}