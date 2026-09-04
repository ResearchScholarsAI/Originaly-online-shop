// Supabase Edge Function: send-otp
// Deploy with: supabase functions deploy send-otp
//
// Generates a 5-digit OTP, stores its SHA-256 hash in
// app_a3f9f1497d_phone_verifications, and sends it via an Iranian SMS
// gateway. Until SMS_PROVIDER_API_KEY is configured (Supabase project
// secrets), it only logs to app_a3f9f1497d_sms_log and returns success —
// this lets the whole registration/checkout flow be built and tested before
// a real SMS contract exists, exactly as specified in the master prompt.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Pick ONE real Iranian SMS gateway when ready — Twilio does not reliably
// serve Iranian numbers. Kavenegar / Melipayamak / IPPanel / Faraz SMS all
// have simple REST APIs; only this function needs to change.
const SMS_PROVIDER_API_KEY = Deno.env.get("SMS_PROVIDER_API_KEY") ?? "";

const PHONE_RE = /^09\d{9}$/;

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendViaProvider(phone: string, message: string): Promise<{ success: boolean; provider: string }> {
  if (!SMS_PROVIDER_API_KEY) {
    // Not configured yet — log only, do not fail the request.
    return { success: false, provider: "not_configured" };
  }

  // Example shape for Kavenegar's REST API — replace with whichever
  // provider is actually contracted:
  //
  // const res = await fetch(
  //   `https://api.kavenegar.com/v1/${SMS_PROVIDER_API_KEY}/sms/send.json`,
  //   {
  //     method: "POST",
  //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //     body: new URLSearchParams({ receptor: phone, message }),
  //   },
  // );
  // return { success: res.ok, provider: "kavenegar" };

  return { success: false, provider: "not_configured" };
}

Deno.serve(async (req) => {
  try {
    const { phone } = await req.json();
    if (typeof phone !== "string" || !PHONE_RE.test(phone)) {
      return Response.json({ error: "Invalid Iranian mobile number" }, { status: 400 });
    }

    const code = String(Math.floor(10000 + Math.random() * 90000)); // 5-digit OTP
    const codeHash = await sha256(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { error: insertError } = await supabase
      .from("app_a3f9f1497d_phone_verifications")
      .insert({ phone, code_hash: codeHash, expires_at: expiresAt });
    if (insertError) throw insertError;

    const message = `کد تایید اورجینالی: ${code}\nاعتبار: ۵ دقیقه`;
    const result = await sendViaProvider(phone, message);

    await supabase.from("app_a3f9f1497d_sms_log").insert({
      phone,
      message,
      provider: result.provider,
      success: result.success,
    });

    // While no provider is configured, respond success so the UI flow can
    // still be developed/tested end-to-end; switch this to `result.success`
    // once a real provider is wired in, so failed sends are surfaced.
    return Response.json({ ok: true, providerConfigured: Boolean(SMS_PROVIDER_API_KEY) });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
