import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import {
  listHabitsWithToday,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleTodayLog,
  type HabitWithToday,
} from "@/lib/habits.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6366f1", "#ec4899", "#ef4444", "#f59e0b",
  "#10b981", "#06b6d4", "#8b5cf6", "#64748b",
];

export const Route = createFileRoute("/_authenticated/habits")({
  component: HabitsPage,
});

function HabitsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listHabitsWithToday);
  const toggle = useServerFn(toggleTodayLog);
  const del = useServerFn(deleteHabit);

  const { data, isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: () => list(),
  });

  const toggleMut = useMutation({
    mutationFn: (habitId: string) => toggle({ data: { habitId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "실패"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("삭제되었습니다");
      qc.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "실패"),
  });

  const [editing, setEditing] = useState<HabitWithToday | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">내 습관</h1>
          <p className="text-sm text-muted-foreground">오늘 한 습관을 체크해보세요</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" /> 습관 추가
            </Button>
          </DialogTrigger>
          <HabitDialog onClose={() => setAddOpen(false)} mode="create" />
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">불러오는 중...</p>
      ) : !data || data.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">아직 습관이 없습니다. "습관 추가"로 시작해보세요.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((h) => (
            <Card key={h.id} className="flex items-center gap-4 p-4">
              <button
                onClick={() => toggleMut.mutate(h.id)}
                disabled={toggleMut.isPending}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  h.checkedToday ? "border-transparent text-white" : "border-border text-transparent hover:border-primary",
                )}
                style={h.checkedToday ? { backgroundColor: h.color } : undefined}
                aria-label={h.checkedToday ? "오늘 체크 해제" : "오늘 체크"}
              >
                <Check className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
                  <span className="truncate font-medium text-foreground">{h.name}</span>
                </div>
                {h.description && (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{h.description}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditing(h)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`"${h.name}" 습관을 삭제할까요? 모든 기록이 함께 삭제됩니다.`)) {
                    deleteMut.mutate(h.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <HabitDialog mode="edit" habit={editing} onClose={() => setEditing(null)} />
        )}
      </Dialog>
    </main>
  );
}

function HabitDialog(props: {
  mode: "create" | "edit";
  habit?: HabitWithToday;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const create = useServerFn(createHabit);
  const update = useServerFn(updateHabit);

  const [name, setName] = useState(props.habit?.name ?? "");
  const [description, setDescription] = useState(props.habit?.description ?? "");
  const [color, setColor] = useState(props.habit?.color ?? COLORS[0]);

  const mut = useMutation({
    mutationFn: async () => {
      if (props.mode === "create") {
        return create({ data: { name, description: description || null, color } });
      } else {
        return update({ data: { id: props.habit!.id, name, description: description || null, color } });
      }
    },
    onSuccess: () => {
      toast.success(props.mode === "create" ? "추가되었습니다" : "수정되었습니다");
      qc.invalidateQueries({ queryKey: ["habits"] });
      props.onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "실패"),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{props.mode === "create" ? "습관 추가" : "습관 수정"}</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          mut.mutate();
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">이름</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">설명 (선택)</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label>색상</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-transform",
                  color === c ? "scale-110 border-foreground" : "border-transparent",
                )}
                style={{ backgroundColor: c }}
                aria-label={`색상 ${c}`}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={props.onClose}>
            취소
          </Button>
          <Button type="submit" disabled={mut.isPending}>
            {props.mode === "create" ? "추가" : "저장"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}