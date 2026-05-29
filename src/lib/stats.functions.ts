import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BasicStats = {
  totalHabits: number;
  monthChecks: number;
  monthCompletionRate: number; // 0..1
  longestStreak: number;
};

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const getBasicStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BasicStats> => {
    const { supabase } = context;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = ymd(monthStart);
    const elapsedDays = now.getDate();

    const { count: habitCount, error: hErr } = await supabase
      .from("habits")
      .select("*", { count: "exact", head: true });
    if (hErr) throw new Error(hErr.message);
    const totalHabits = habitCount ?? 0;

    const { data: monthLogs, error: mErr } = await supabase
      .from("habit_logs")
      .select("logged_date")
      .gte("logged_date", monthStartStr);
    if (mErr) throw new Error(mErr.message);
    const monthChecks = monthLogs?.length ?? 0;

    const denom = totalHabits * elapsedDays;
    const monthCompletionRate = denom > 0 ? Math.min(1, monthChecks / denom) : 0;

    // Streak: consecutive days (ending today or yesterday) with at least 1 log
    const { data: allLogs, error: lErr } = await supabase
      .from("habit_logs")
      .select("logged_date")
      .order("logged_date", { ascending: false })
      .limit(1000);
    if (lErr) throw new Error(lErr.message);

    const daySet = new Set<string>((allLogs ?? []).map((r) => r.logged_date as string));
    let streak = 0;
    const cursor = new Date(now);
    // if today not checked, start from yesterday
    if (!daySet.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (daySet.has(ymd(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      totalHabits,
      monthChecks,
      monthCompletionRate,
      longestStreak: streak,
    };
  });