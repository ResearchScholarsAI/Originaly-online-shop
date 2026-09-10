import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyProfile, myOrders, requestOtp, saveProfileName, verifyOtp, type OrderDTO, type ProfileDTO } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toman } from "@/lib/utils";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [demo, setDemo] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const p = await getMyProfile();
      setProfile(p);
      setName(p?.name ?? user.displayName ?? "");
      setPhone(p?.phone ?? "");
      setOrders(await myOrders());
    })();
  }, [user]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">حساب کاربری</h1>
      <p className="mt-2 text-sm text-muted">{user.primaryEmail}</p>

      <section className="mt-8 rounded-xl border border-border p-5">
        <h2 className="font-medium">اطلاعات</h2>
        <Label className="mt-4">نام</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Button
          className="mt-3"
          variant="outline"
          onClick={async () => {
            await saveProfileName({ data: { name } });
            toast.success("ذخیره شد");
          }}
        >
          ذخیره نام
        </Button>

        <p className="mt-6 text-sm">
          وضعیت موبایل:{" "}
          {profile?.phone_verified_at ? (
            <span className="text-ok">تأیید شده ({profile.phone})</span>
          ) : (
            <span className="text-warn">تأیید نشده — خرید ممکن نیست</span>
          )}
        </p>
        {!profile?.phone_verified_at ? (
          <div className="mt-3 space-y-2">
            <Label>شماره</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            <Button
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
            {demo ? <p className="text-xs text-ok">کد آزمایشی: {demo}</p> : null}
            <Label>کد</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" />
            <Button
              onClick={async () => {
                try {
                  await verifyOtp({ data: { phone, code } });
                  setProfile(await getMyProfile());
                  toast.success("تأیید شد");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "خطا");
                }
              }}
            >
              تأیید
            </Button>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-medium">سفارش‌ها</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">سفارشی ندارید.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="rounded-lg border border-border p-3 text-sm">
                <span className="font-medium">{o.id}</span>
                <span className="mx-2 text-muted">{o.status}</span>
                <span className="tabular-nums">{toman(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/admin" className="mt-10 inline-block text-sm text-muted hover:text-fg">
        ورود به پنل مدیریت →
      </Link>
    </div>
  );
}
