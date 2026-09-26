import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">
          OUTLOOK STUDIO Admin
        </h1>

        <p className="mt-3 text-white/70">
          Admin access verified.
        </p>
      </div>
    </main>
  );
}