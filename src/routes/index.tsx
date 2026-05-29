import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "습관 트래커" },
      { name: "description", content: "매일의 작은 습관을 기록하는 개인용 트래커." },
      { property: "og:title", content: "습관 트래커" },
      { property: "og:description", content: "매일의 작은 습관을 기록하는 개인용 트래커." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-foreground">습관 트래커</h1>
        <p className="mt-2 text-sm text-muted-foreground">프로젝트 셋업 완료 — 페이지는 곧 추가됩니다.</p>
      </div>
    </main>
  );
}
