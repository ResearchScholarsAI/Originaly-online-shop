// Supabase Edge Function: zarinpal-request
// Deploy with: supabase functions deploy zarinpal-request
//
// Starts a ZarinPal payment. Reads ZARINPAL_MERCHANT_ID from Supabase
// project secrets — until that secret is set, this function responds with
// ok:false and a clear reason, which the frontend's `isZarinpalConfigured()`
// / `createZarinpalPaymentRequest()` (src/lib/store.ts) surfaces as the
// "پرداخت آنلاین (به‌زودی)" state rather than a broken button.

const MERCHANT_ID = Deno.env.get("ZARINPAL_MERCHANT_ID") ?? "";
const CALLBACK_URL = Deno.env.get("ZARINPAL_CALLBACK_URL") ?? "https://originally.ir/payment/callback";

Deno.serve(async (req) => {
  try {
    if (!MERCHANT_ID) {
      return Response.json({ ok: false, error: "ZarinPal merchant ID not configured" }, { status: 200 });
    }

    const { orderNumber, amount } = await req.json();
    if (!orderNumber || !amount) {
      return Response.json({ ok: false, error: "orderNumber and amount are required" }, { status: 400 });
    }

    const res = await fetch("https://payment.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: amount * 10, // Toman -> Rial, ZarinPal's API expects Rial
        callback_url: `${CALLBACK_URL}?order=${orderNumber}`,
        description: `سفارش ${orderNumber} — اورجینالی`,
      }),
    });
    const json = await res.json();

    if (json?.data?.code === 100) {
      return Response.json({
        ok: true,
        authority: json.data.authority,
        redirectUrl: `https://www.zarinpal.com/pg/StartPay/${json.data.authority}`,
      });
    }
    return Response.json({ ok: false, error: json?.errors?.message ?? "ZarinPal request failed" });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
