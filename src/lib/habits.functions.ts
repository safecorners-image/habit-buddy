import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type HabitWithToday = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  checkedToday: boolean;
};

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const listHabitsWithToday = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HabitWithToday[]> => {
    const { supabase } = context;
    const today = todayStr();
    const { data: habits, error } = await supabase
      .from("habits")
      .select("id, name, description, color, created_at")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const ids = (habits ?? []).map((h) => h.id);
    let checkedSet = new Set<string>();
    if (ids.length) {
      const { data: logs, error: logErr } = await supabase
        .from("habit_logs")
        .select("habit_id")
        .eq("logged_date", today)
        .in("habit_id", ids);
      if (logErr) throw new Error(logErr.message);
      checkedSet = new Set((logs ?? []).map((l) => l.habit_id));
    }
    return (habits ?? []).map((h) => ({
      id: h.id,
      name: h.name,
      description: h.description,
      color: h.color,
      checkedToday: checkedSet.has(h.id),
    }));
  });

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const createHabit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("habits").insert({
      user_id: userId,
      name: data.name,
      description: data.description ?? null,
      color: data.color,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const updateSchema = createSchema.extend({ id: z.string().uuid() });

export const updateHabit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("habits")
      .update({
        name: data.name,
        description: data.description ?? null,
        color: data.color,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteHabit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // delete logs first (no FK cascade defined)
    await supabase.from("habit_logs").delete().eq("habit_id", data.id);
    const { error } = await supabase.from("habits").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleTodayLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ habitId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = todayStr();
    const { data: existing, error: selErr } = await supabase
      .from("habit_logs")
      .select("id")
      .eq("habit_id", data.habitId)
      .eq("logged_date", today)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    if (existing) {
      const { error } = await supabase.from("habit_logs").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { checked: false };
    } else {
      const { error } = await supabase.from("habit_logs").insert({
        habit_id: data.habitId,
        user_id: userId,
        logged_date: today,
      });
      if (error) throw new Error(error.message);
      return { checked: true };
    }
  });