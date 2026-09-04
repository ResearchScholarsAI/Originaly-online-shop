// Supabase Edge Function: zarinpal-verify
// Deploy with: supabase functions deploy zarinpal-verify
//
// Confirms a ZarinPal payment after the customer returns from the gateway,
// and updates the matching order's payment_status. Reads
// ZARINPAL_MERCHANT_ID from Supabase project secrets, same as
// zarinpal-request.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MERCHANT_ID = Deno.env.get("ZARINPAL_MERCHANT_ID") ?? "";
const ORDERS_TABLE = "app_a3f9f1497d_orders";

Deno.serve(async (req) => {
  try {
    if (!MERCHANT_ID) {
      return Response.json({ ok: false, error: "ZarinPal merchant ID not configured" }, { status: 200 });
    }

    const { authority, status, amount, orderNumber } = await req.json();
    if (status !== "OK") {
      return Response.json({ ok: false, error: "Payment was cancelled by the user" });
    }

    const res = await fetch("https://payment.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant_id: MERCHANT_ID, amount: amount * 10, authority }),
    });
    const json = await res.json();

    const ok = json?.data?.code === 100 || json?.data?.code === 101;
    if (ok) {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      await supabase
        .from(ORDERS_TABLE)
        .update({ payment_status: "paid", payment_ref_id: json.data.ref_id })
        .eq("order_number", orderNumber);
      return Response.json({ ok: true, refId: json.data.ref_id });
    }
    return Response.json({ ok: false, error: json?.errors?.message ?? "Verification failed" });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
