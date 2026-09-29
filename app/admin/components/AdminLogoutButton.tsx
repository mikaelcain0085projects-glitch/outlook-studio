"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoading(false);
      return;
    }

    window.location.href = "/admin/login";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="group inline-flex h-8 items-center justify-center gap-2 rounded-full border border-[#9A5963]/20 bg-[#F7E5E7]/70 px-3.5 text-[8px] font-medium uppercase tracking-[0.16em] text-[#8A4D57] shadow-[0_4px_14px_rgba(0,0,0,0.025)] transition-all duration-300 hover:border-[#9A5963]/35 hover:bg-[#F3D9DD] hover:text-[#6F3E47] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <span
            className="h-3 w-3 animate-spin rounded-full border-2 border-[#8A4D57]/20 border-t-[#8A4D57]"
            aria-hidden="true"
          />
          Logging out...
        </>
      ) : (
        <>
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#9A5963]/70 transition-all duration-300 group-hover:bg-[#8A4D57]"
            aria-hidden="true"
          />
          Log out
        </>
      )}
    </button>
  );
}