import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, PackageCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { cn, toman } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SignInGate } from "@/lib/auth/gates";
import { canPurchaseProduct } from "@/lib/catalog";
import { safeListProducts } from "@/lib/store";
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

export const Route = createFileRoute("/cart")({
  loader: () => safeListProducts({}),
  component: CartPage,
});

type CheckoutConfig = Awaited<ReturnType<typeof zarinpalReady>>;

function CartPage() {
  const catalog = Route.useLoaderData();
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const lines = useMemo(
    () => items.map((item) => {
      const product = catalog.find((candidate) => candidate.id === item.productId);
      const valid = Boolean(product && canPurchaseProduct(product) && product.sizes.trim() === item.size);
      return { item, product: valid ? product : null };
    }),
    [catalog, items],
  );
  const valid = lines.every((line) => line.product !== null);
  const total = lines.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.item.qty, 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="font-display text-3xl font-extrabold">سبد خرید</h1>
        {items.length === 0 ? (
          <p className="mt-8 text-muted">
            سبد خالی است. <Link to="/shop" className="underline">فروشگاه</Link>
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {lines.map(({ item, product }) => (
              <li key={`${item.productId}-${item.size}`} className="flex gap-4 rounded-xl border border-border p-3">
                <img src={product?.image ?? item.image} alt="" className="size-24 rounded-lg object-cover" />
                <div className="flex-1">
                  {product ? (
                    <Link to="/product/$slug" params={{ slug: product.slug }} className="font-medium">{product.nameFa}</Link>
                  ) : (
                    <p className="font-medium">{item.nameFa}</p>
                  )}
                  <p className="text-sm text-muted">سایز ثابت: {product?.sizes ?? item.size}</p>
                  <p className="mt-1 text-sm tabular-nums">{product ? toman(product.price) : "برای سفارش آماده نیست"}</p>
                  {!product ? (
                    <p className="mt-1 flex items-center gap-1 text-xs text-warn">
                      <AlertTriangle className="size-3.5" /> این کالا ناموجود است یا اطلاعاتش در حال بررسی است؛ برای ادامهٔ خرید آن را حذف کنید.
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="کاهش تعداد"
                      className="size-8 rounded-md border border-border"
                      onClick={() => setQty(item.productId, item.size, item.qty - 1, product?.stock)}
                    >−</button>
                    <span className="w-6 text-center tabular-nums">{item.qty}</span>
                    <button
                      aria-label="افزایش تعداد"
                      className="size-8 rounded-md border border-border"
                      disabled={!product || item.qty >= product.stock}
                      onClick={() => setQty(item.productId, item.size, item.qty + 1, product?.stock)}
                    >+</button>
                    <span className="text-xs text-muted">{product ? `موجودی: ${product.stock}` : ""}</span>
                    <button className="mr-auto text-sm text-danger" onClick={() => remove(item.productId, item.size)}>حذف</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <aside className="h-fit rounded-xl border border-border bg-elevated p-5">
        <p className="text-sm text-muted">جمع کالاها</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{toman(total)}</p>
        <p className="mt-3 flex items-start gap-2 text-xs leading-6 text-muted">
          <Truck className="mt-1 size-4 shrink-0 text-primary" />
          ارسال به‌صورت پس‌کرایه است؛ هزینهٔ حمل را شرکت حمل‌ونقل هنگام تحویل دریافت می‌کند و در جمع کالاها لحاظ نشده است.
        </p>
        {items.length > 0 ? (
          <div className="mt-6">
            <SignInGate fallback={<NeedLogin />}>
              <Checkout catalogValid={valid} />
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
      <Link to="/login" className={cn(buttonVariants(), "mt-3 w-full")}>ورود / ثبت‌نام</Link>
    </div>
  );
}

function Checkout({ catalogValid }: { catalogValid: boolean }) {
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [addrs, setAddrs] = useState<AddressDTO[]>([]);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [demo, setDemo] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [addrId, setAddrId] = useState<string | null>(null);
  const [pay, setPay] = useState<"offline" | "zarinpal">("offline");
  const [config, setConfig] = useState<CheckoutConfig>({ ready: false, offlineReady: false, offlineInstructions: null });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [profileData, addresses, paymentConfig] = await Promise.all([getMyProfile(), listAddresses(), zarinpalReady()]);
    setProfile(profileData);
    setAddrs(addresses);
    if (addresses[0]) setAddrId(addresses[0].id);
    setConfig(paymentConfig);
  }

  useEffect(() => { void refresh(); }, []);

  const verified = Boolean(profile?.phone_verified_at);
  const canPay = pay === "offline" ? config.offlineReady : config.ready;

  return (
    <div className="space-y-5">
      {!verified ? (
        <div className="rounded-lg border border-warn/40 bg-subtle p-3">
          <p className="text-sm font-medium">تأیید موبایل الزامی است</p>
          <p className="mt-1 text-xs text-muted">ارسال OTP واقعی تا اتصال ارائه‌دهندهٔ پیامک غیرفعال است؛ کد نمایشی فقط در محیط توسعه ظاهر می‌شود.</p>
          <Label className="mt-3">شماره (۰۹…)</Label>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} dir="ltr" placeholder="0912…" />
          <Button className="mt-2 w-full" variant="outline" onClick={async () => {
            try {
              const result = await requestOtp({ data: { phone } });
              setDemo(result.demoCode ?? null);
              toast.message(result.message);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "خطا");
            }
          }}>ارسال کد</Button>
          {demo ? <p className="mt-2 text-xs text-ok">کد توسعه (فقط محلی): {demo}</p> : null}
          <Label className="mt-3">کد شش‌رقمی</Label>
          <Input value={code} onChange={(event) => setCode(event.target.value)} dir="ltr" inputMode="numeric" maxLength={6} />
          <Button className="mt-2 w-full" onClick={async () => {
            try {
              await verifyOtp({ data: { phone, code } });
              toast.success("موبایل تأیید شد");
              await refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "خطا");
            }
          }}>تأیید کد</Button>
        </div>
      ) : (
        <p className="text-sm text-ok">موبایل تأیید شده: {profile?.phone}</p>
      )}

      <div>
        <p className="text-sm font-medium">آدرس ارسال</p>
        {addrs.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {addrs.map((savedAddress) => (
              <li key={savedAddress.id}>
                <label className="flex items-start gap-2 text-sm">
                  <input type="radio" checked={addrId === savedAddress.id} onChange={() => setAddrId(savedAddress.id)} />
                  <span>{savedAddress.city} — {savedAddress.address}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
        <Label className="mt-3">شهر</Label>
        <Input value={city} onChange={(event) => setCity(event.target.value)} />
        <Label className="mt-2">آدرس کامل</Label>
        <Input value={address} onChange={(event) => setAddress(event.target.value)} />
        <Label className="mt-2">کد پستی</Label>
        <Input value={postal} onChange={(event) => setPostal(event.target.value)} dir="ltr" />
        <Button variant="outline" className="mt-2 w-full" onClick={async () => {
          try {
            const result = await saveAddress({ data: { title: "منزل", address, city, postalCode: postal } });
            setAddrId(result.id);
            await refresh();
            toast.success("آدرس ذخیره شد");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "خطا");
          }
        }}>ذخیرهٔ آدرس</Button>
      </div>

      <div>
        <p className="text-sm font-medium">پرداخت</p>
        <label className={cn("mt-2 flex items-center gap-2 text-sm", !config.offlineReady && "opacity-50")}>
          <input type="radio" checked={pay === "offline"} onChange={() => setPay("offline")} disabled={!config.offlineReady} />
          پرداخت دستی / کارت‌به‌کارت {!config.offlineReady ? "(جزئیات پرداخت تنظیم نشده)" : ""}
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm opacity-50">
          <input type="radio" checked={pay === "zarinpal"} onChange={() => setPay("zarinpal")} disabled={!config.ready} />
          زرین‌پال (تا تکمیل درخواست و verify واقعی غیرفعال)
        </label>
        {pay === "offline" && config.offlineReady ? (
          <p className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 text-xs leading-6 text-muted">{config.offlineInstructions}</p>
        ) : null}
        {!config.offlineReady && !config.ready ? (
          <p className="mt-3 rounded-lg border border-warn/30 bg-warn/5 p-3 text-xs leading-6 text-muted">
            ثبت سفارش تا پیکربندی روش پرداخت بسته است. هیچ مبلغی کسر یا سفارش پرداخت‌نشده‌ای ساخته نمی‌شود.
          </p>
        ) : null}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-bg p-3 text-xs leading-6 text-muted">
        <PackageCheck className="mt-1 size-4 shrink-0 text-primary" />
        قیمت و موجودی هنگام ثبت سفارش دوباره از پایگاه داده کنترل می‌شوند؛ هزینهٔ ارسال پس‌کرایه است.
      </div>

      <Button
        className="w-full"
        disabled={!verified || !addrId || busy || !canPay || !catalogValid}
        onClick={async () => {
          if (!addrId) return;
          setBusy(true);
          try {
            const result = await placeOrder({
              data: {
                items: items.map((item) => ({ productId: item.productId, size: item.size, qty: item.qty })),
                paymentMethod: pay,
                addressId: addrId,
              },
            });
            clear();
            toast.success(`سفارش ثبت شد: ${result.orderId}`);
            if (result.paymentInstructions) toast.message(result.paymentInstructions, { duration: 10000 });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "خطا");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "در حال بررسی…" : "ثبت سفارش"}
      </Button>
    </div>
  );
}
