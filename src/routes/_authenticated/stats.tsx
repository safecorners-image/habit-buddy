import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBasicStats } from "@/lib/stats.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/stats")({
  component: StatsPage,
});

function StatsPage() {
  const fetchStats = useServerFn(getBasicStats);
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetchStats(),
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">통계</h1>
      {isLoading || !data ? (
        <p className="text-muted-foreground">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="전체 습관" value={String(data.totalHabits)} />
          <StatCard label="이번 달 체크" value={String(data.monthChecks)} />
          <StatCard
            label="이번 달 완료율"
            value={`${Math.round(data.monthCompletionRate * 100)}%`}
          />
          <StatCard label="연속 기록" value={`${data.longestStreak}일`} />
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}