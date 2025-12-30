import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim();
    const login_success = Boolean(body.login_success);

    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("history").insert({
      username,
      login_success,
      login_time: new Date().toISOString(),
    });

    if (error) {
      // 常見：username 不存在 profiles（外鍵擋下）
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
