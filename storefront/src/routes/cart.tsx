import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cartTotal, useCart } from "@/lib/cart";
import { cn, toman } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SignInGate } from "@/lib/auth/gates";
import {
  getMyProfile,
  listAddresses,
  placeOrder,
  requestOtp,
  saveAddress,
  verifyOtp,
  zarinpalReady,
  type AddressDTO,
  type ProfileDTO,
} from "@/lib/store";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = cartTotal(items);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="font-display text-3xl font-extrabold">سبد خرید</h1>
        {items.length === 0 ? (
          <p className="mt-8 text-muted">
            سبد خالی است.{" "}
            <Link to="/shop" className="underline">
              فروشگاه
            </Link>
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {items.map((it) => (
              <li key={`${it.productId}-${it.size}`} className="flex gap-4 rounded-xl border border-border p-3">
                <img src={it.image} alt="" className="size-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <Link to="/product/$slug" params={{ slug: it.slug }} className="font-medium">
                    {it.nameFa}
                  </Link>
                  <p className="text-sm text-muted">سایز {it.size}</p>
                  <p className="mt-1 text-sm tabular-nums">{toman(it.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="size-8 rounded-md border border-border"
                      onClick={() => setQty(it.productId, it.size, it.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center tabular-nums">{it.qty}</span>
                    <button
                      className="size-8 rounded-md border border-border"
                      onClick={() => setQty(it.productId, it.size, it.qty + 1)}
                    >
                      +
                    </button>
                    <button className="mr-auto text-sm text-danger" onClick={() => remove(it.productId, it.size)}>
                      حذف
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <aside className="h-fit rounded-xl border border-border bg-elevated p-5">
        <p className="text-sm text-muted">جمع کل</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{toman(total)}</p>
        {items.length > 0 ? (
          <div className="mt-6">
            <SignInGate fallback={<NeedLogin />}>
              <Checkout />
            </SignInGate>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function NeedLogin() {
  return (
    <div>
      <p className="text-sm text-muted">برای تکمیل خرید وارد شوید.</p>
      <Link to="/login" className={cn(buttonVariants(), "mt-3 w-full")}>
        ورود / ثبت‌نام
      </Link>
    </div>
  );
}

function Checkout() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [addrs, setAddrs] = useState<AddressDTO[]>([]);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [demo, setDemo] = useState<string | null>(null);
  const [city, setCity] = useState("نظرآباد");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [addrId, setAddrId] = useState<string | null>(null);
  const [pay, setPay] = useState<"offline" | "zarinpal">("offline");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [p, a, z] = await Promise.all([getMyProfile(), listAddresses(), zarinpalReady()]);
    setProfile(p);
    setAddrs(a);
    if (a[0]) setAddrId(a[0].id);
    setReady(z.ready);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const verified = Boolean(profile?.phone_verified_at);

  return (
    <div className="space-y-5">
      {!verified ? (
        <div className="rounded-lg border border-warn/40 bg-subtle p-3">
          <p className="text-sm font-medium">تأیید موبایل الزامی است</p>
          <p className="mt-1 text-xs text-muted">
            خرید تا تأیید شماره قفل است. پیامک واقعی بعد از اتصال ارائه‌دهنده (کاوه‌نگار / Bird / سرویس ایرانی) فعال می‌شود.
          </p>
          <Label className="mt-3">شماره (۰۹…)</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder="0912…" />
          <Button
            className="mt-2 w-full"
            variant="outline"
            onClick={async () => {
              try {
                const r = await requestOtp({ data: { phone } });
                setDemo(r.demoCode ?? null);
                toast.message(r.message);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "خطا");
              }
            }}
          >
            ارسال کد
          </Button>
          {demo ? <p className="mt-2 text-xs text-ok">کد آزمایشی: {demo}</p> : null}
          <Label className="mt-3">کد</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" />
          <Button
            className="mt-2 w-full"
            onClick={async () => {
              try {
                await verifyOtp({ data: { phone, code } });
                toast.success("موبایل تأیید شد");
                await refresh();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "خطا");
              }
            }}
          >
            تأیید کد
          </Button>
        </div>
      ) : (
        <p className="text-sm text-ok">موبایل تأیید شده: {profile?.phone}</p>
      )}

      <div>
        <p className="text-sm font-medium">آدرس ارسال</p>
        {addrs.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {addrs.map((a) => (
              <li key={a.id}>
                <label className="flex items-start gap-2 text-sm">
                  <input type="radio" checked={addrId === a.id} onChange={() => setAddrId(a.id)} />
                  <span>
                    {a.city} — {a.address}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
        <Label className="mt-3">شهر</Label>
        <Input value={city} onChange={(e) => setCity(e.target.value)} />
        <Label className="mt-2">آدرس</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        <Label className="mt-2">کد پستی</Label>
        <Input value={postal} onChange={(e) => setPostal(e.target.value)} dir="ltr" />
        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={async () => {
            try {
              const r = await saveAddress({
                data: { title: "منزل", address, city, postalCode: postal },
              });
              setAddrId(r.id);
              await refresh();
              toast.success("آدرس ذخیره شد");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "خطا");
            }
          }}
        >
          ذخیره آدرس
        </Button>
      </div>

      <div>
        <p className="text-sm font-medium">پرداخت</p>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="radio" checked={pay === "offline"} onChange={() => setPay("offline")} />
          پرداخت دستی / کارت‌به‌کارت
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={pay === "zarinpal"}
            onChange={() => setPay("zarinpal")}
            disabled={!ready}
          />
          {ready ? "زرین‌پال" : "پرداخت آنلاین (به‌زودی)"}
        </label>
      </div>

      <Button
        className="w-full"
        disabled={!verified || !addrId || busy}
        onClick={async () => {
          if (!addrId) return;
          setBusy(true);
          try {
            const r = await placeOrder({
              data: {
                items: items.map((i) => ({
                  productId: i.productId,
                  nameFa: i.nameFa,
                  size: i.size,
                  qty: i.qty,
                  price: i.price,
                })),
                paymentMethod: pay,
                addressId: addrId,
              },
            });
            clear();
            toast.success(`سفارش ثبت شد: ${r.orderId}`);
            if (r.redirect) window.location.href = r.redirect;
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "خطا");
          } finally {
            setBusy(false);
          }
        }}
      >
        ثبت سفارش
      </Button>
    </div>
  );
}
