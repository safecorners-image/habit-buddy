import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/habits" : "/login" });
  },
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
  return null;
}
