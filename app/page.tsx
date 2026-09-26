import { createClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        {user ? (
          <>
            <h1 className="text-2xl font-semibold">
              Google Login Successful
            </h1>

            <p className="mt-3 text-white/70">
              Logged in as: {user.email}
            </p>
          </>
        ) : (
          <p className="text-white/70">No active session</p>
        )}
      </div>
    </main>
  );
}