"use client";

import { createClient } from "@/lib/supabase-browser";

export default function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="rounded-lg border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
    >
      Continue with Google
    </button>
  );
}