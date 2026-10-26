
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "Cron secret is not configured" },
      { status: 500 }
    );
  }

  if (
    request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("orders")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase keep-alive failed:", error.message);

      return NextResponse.json(
        { error: "Database request failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "OUTLOOK STUDIOS database check successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Keep-alive error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
