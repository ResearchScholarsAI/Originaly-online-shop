import { useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isPending && user) return <Navigate to="/account" />;

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message);
      }
      window.location.href = "/account";
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "خطا در ورود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative mx-auto grid max-w-lg px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <BrandMark className="size-14" />
        <div>
          <h1 className="font-display text-3xl font-extrabold">ورود به اورجینالی</h1>
          <p className="mt-1 text-sm text-muted">حساب، بعد OTP موبایل ایرانی — بدون تأیید، خرید ممکن نیست.</p>
        </div>
      </div>

      <div className="glass mb-8 rounded-2xl p-4">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Smartphone className="size-4 text-primary" /> احراز هویت دو مرحله‌ای
        </p>
        <p className="mt-2 text-xs leading-6 text-muted">
          ۱) ورود با حساب. ۲) ارسال کد به شماره ۰۹xxxxxxxxx. ارائه‌دهندهٔ پیامک قابل تعویض است (کاوه‌نگار / Bird / سرویس ایرانی بعدی) بدون بازنویسی فروشگاه.
        </p>
        <p className="mt-2 flex items-center gap-2 text-xs text-primary">
          <ShieldCheck className="size-3.5" /> لایه SMS جدا از هستهٔ فروشگاه است
        </p>
      </div>

      {authEnabled ? (
        <div className="space-y-3">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              variant="outline"
              className="w-full"
              onClick={() => signIn(p.providerId, { callbackURL: "/account" })}
            >
              ادامه با {p.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">ورود اجتماعی در این پیش‌نمایش خاموش است — از ایمیل استفاده کنید.</p>
      )}

      <div className="my-8 h-px bg-border" />

      <div className="mb-4 flex gap-2">
        <Button size="sm" variant={mode === "in" ? "primary" : "ghost"} onClick={() => setMode("in")}>
          ورود با ایمیل
        </Button>
        <Button size="sm" variant={mode === "up" ? "primary" : "ghost"} onClick={() => setMode("up")}>
          ساخت حساب
        </Button>
      </div>

      <form onSubmit={onEmail} className="space-y-3">
        {mode === "up" ? (
          <div>
            <Label>نام</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
        ) : null}
        <div>
          <Label>ایمیل</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
        </div>
        <div>
          <Label>رمز عبور</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            dir="ltr"
          />
        </div>
        {err ? <p className="text-sm text-danger">{err}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "لطفاً صبر کنید…" : mode === "up" ? "ثبت‌نام و رفتن به تأیید موبایل" : "ورود و تأیید موبایل"}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs leading-6 text-faint">
        بعد از ورود، در صفحهٔ حساب کد ۶ رقمی را روی شماره ایرانی خود بگیرید. تا آن لحظه دکمهٔ پرداخت قفل است.
      </p>
      <Link to="/" className={cn(buttonVariants({ variant: "ghost" }), "mt-6 justify-center")}>
        بازگشت به فروشگاه
      </Link>
    </main>
  );
}
