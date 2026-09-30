"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setActionError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });

    if (error) {
      setActionError("Unable to continue with Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F1EDE7] text-[#171717]">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-xl font-normal tracking-[0.28em] transition-all duration-500 hover:tracking-[0.4em]"
            >
              OUTLOOK{" "}
              <span className="text-[#171717]/50">
                STUDIO
              </span>
            </button>

            <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-[#171717]/40">
              Administration
            </p>
          </div>

          {/* Login card */}
          <section className="mt-10 rounded-[28px] border border-black/[0.06] bg-white/75 p-7 shadow-[0_24px_70px_rgba(40,35,30,0.08)] backdrop-blur-xl sm:p-9">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-[0_10px_30px_rgba(23,23,23,0.14)]">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3L14.1 8.2L19.7 8.7L15.4 12.4L16.7 17.8L12 15L7.3 17.8L8.6 12.4L4.3 8.7L9.9 8.2L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 className="mt-6 text-2xl font-light tracking-[-0.04em] sm:text-3xl">
                Welcome back.
              </h1>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#171717]/50">
                Sign in with your authorized Google account to access the
                OUTLOOK STUDIO control center.
              </p>
            </div>

            {actionError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-600">
                {actionError}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="group mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-[#171717]/10 bg-[#171717] px-6 text-xs font-medium uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(23,23,23,0.14)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#252525] hover:shadow-[0_16px_40px_rgba(23,23,23,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {googleLoading ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white"
                    aria-hidden="true"
                  />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 21.99c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.99Z"
                    />
                    <path
                      fill="currentColor"
                      d="M6.54 14.07A5.86 5.86 0 0 1 6.23 12c0-.72.12-1.42.31-2.07V7.4H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.6l3.24-2.53Z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.9c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 2.97 14.63 2 12 2a9.75 9.75 0 0 0-8.7 5.4l3.24 2.53C7.31 7.62 9.46 5.9 12 5.9Z"
                    />
                  </svg>

                  <span>Continue with Google</span>

                  <span className="text-lg text-white/50 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white">
                    →
                  </span>
                </>
              )}
            </button>

            <div className="mt-7 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#171717]/10" />
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#171717]/30">
                Authorized access only
              </span>
              <span className="h-px w-8 bg-[#171717]/10" />
            </div>
          </section>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mx-auto mt-7 block text-[12px] uppercase tracking-[0.2em] text-[#171717]/50 transition-colors hover:text-[#171717]"
          >
            ← Return to store
          </button>
        </div>
      </div>
    </main>
  );
}