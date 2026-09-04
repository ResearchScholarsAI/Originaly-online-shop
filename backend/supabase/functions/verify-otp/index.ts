// Supabase Edge Function: verify-otp
// Deploy with: supabase functions deploy verify-otp
//
// Verifies a submitted OTP code against the hashed value stored by
// send-otp. On success, marks the code consumed and upserts a row in
// app_a3f9f1497d_customers with phone_verified_at set — this is the single
// place `phone_verified_at` is ever written, so the checkout guard (§3.2 of
// the master prompt) can trust it.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const { phone, code } = await req.json();
    if (typeof phone !== "string" || typeof code !== "string") {
      return Response.json({ error: "phone and code are required" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const codeHash = await sha256(code);

    const { data: rows, error } = await supabase
      .from("app_a3f9f1497d_phone_verifications")
      .select("*")
      .eq("phone", phone)
      .eq("code_hash", codeHash)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;

    if (!rows || rows.length === 0) {
      return Response.json({ verified: false, reason: "invalid_or_expired" });
    }

    await supabase
      .from("app_a3f9f1497d_phone_verifications")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", rows[0].id);

    // Upsert the customer record with phone_verified_at set.
    const { data: existing } = await supabase
      .from("app_a3f9f1497d_customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("app_a3f9f1497d_customers")
        .update({ phone_verified_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("app_a3f9f1497d_customers")
        .insert({ phone, phone_verified_at: new Date().toISOString() });
    }

    return Response.json({ verified: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
