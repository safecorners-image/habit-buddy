import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppNav() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-foreground">습관 트래커</span>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              to="/habits"
              className="rounded px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "rounded px-3 py-1.5 bg-accent text-accent-foreground" }}
            >
              습관
            </Link>
            <Link
              to="/stats"
              className="rounded px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "rounded px-3 py-1.5 bg-accent text-accent-foreground" }}
            >
              통계
            </Link>
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>
    </header>
  );
}