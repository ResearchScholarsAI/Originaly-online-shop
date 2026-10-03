import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  adminCustomers,
  adminOrders,
  claimAdmin,
  exportCustomersCsv,
  exportWoo,
  type AddressDTO,
  type CustomerDTO,
  type OrderDTO,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadFile, toman } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { user, isPending } = useCurrentUserState();
  const [tab, setTab] = useState<"customers" | "orders" | "export">("customers");
  const [people, setPeople] = useState<CustomerDTO[]>([]);
  const [addrs, setAddrs] = useState<AddressDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [q, setQ] = useState("");
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const c = await adminCustomers();
      setPeople(c.people);
      setAddrs(c.addrs);
      setOrders(await adminOrders());
      setDenied(false);
    } catch {
      setDenied(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) void load();
  }, [user]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  if (denied) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-2xl font-bold">پنل مدیریت</h1>
        <p className="mt-3 text-sm text-muted">
          این بخش فقط برای مدیر فروشگاه است. داده‌های مشتریان اطلاعات شخصی هستند.
        </p>
        <p className="mt-5 rounded-xl border border-warn/30 bg-subtle p-4 text-sm leading-7 text-warn">
          فقط ایمیلی که مالک در متغیر امن سرور HQ_ADMIN_EMAILS مجاز کرده باشد می‌تواند مدیر نخست را فعال کند؛ پس از ثبت مدیر اول، این امکان برای همیشه بسته می‌شود.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          disabled={claiming}
          onClick={async () => {
            setClaiming(true);
            try {
              await claimAdmin();
              toast.success("دسترسی مدیر فعال شد");
              await load();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "فعال‌سازی مدیر انجام نشد");
            } finally {
              setClaiming(false);
            }
          }}
        >
          {claiming ? "در حال بررسی…" : "فعال‌سازی مدیر اولیه"}
        </Button>
      </div>
    );
  }

  const filtered = people.filter((p) => {
    const blob = `${p.name ?? ""} ${p.phone ?? ""} ${p.email ?? ""}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">پنل مدیریت</h1>
      <p className="mt-2 text-xs text-warn">شماره و آدرس مشتریان دادهٔ شخصی است. دسترسی محدود به حساب مدیر.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["customers", "orders", "export"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
            {t === "customers" ? "مشتریان" : t === "orders" ? "سفارش‌ها" : "خروجی وردپرس"}
          </Button>
        ))}
      </div>

      {loading ? <Skeleton className="mt-8 h-40" /> : null}

      {tab === "customers" ? (
        <section className="mt-8">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو نام / موبایل / ایمیل" />
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                const csv = await exportCustomersCsv();
                downloadFile("customers-sms.csv", csv, "text/csv");
              }}
            >
              خروجی پیامک
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const csv = await exportCustomersCsv();
                downloadFile("customers-tax.csv", csv, "text/csv");
              }}
            >
              خروجی مالیات
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="bg-subtle text-muted">
                <tr>
                  {["نام", "موبایل", "تأیید", "سفارش", "خرید", "ایمیل"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.user_id} className="border-t border-border">
                    <td className="px-3 py-2">{p.name ?? "—"}</td>
                    <td className="px-3 py-2" dir="ltr">
                      {p.phone ?? "—"}
                    </td>
                    <td className="px-3 py-2">{p.phone_verified_at ? "بله" : "خیر"}</td>
                    <td className="px-3 py-2">{p.total_orders}</td>
                    <td className="px-3 py-2 tabular-nums">{toman(p.total_spent)}</td>
                    <td className="px-3 py-2">{p.email ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mt-8 font-medium">آدرس‌ها</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {addrs.map((a) => (
              <li key={a.id}>
                {a.city} · {a.postal_code} · {a.address}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "orders" ? (
        <ul className="mt-8 space-y-2">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-border p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">{o.id}</span>
                <span className="tabular-nums">{toman(o.total)}</span>
              </div>
              <p className="mt-1 text-muted">
                {o.customer_name} · {o.customer_phone} · {o.city} · {o.payment_method} / {o.payment_status}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "export" ? (
        <section className="mt-8 space-y-3">
          <p className="text-sm text-muted">خروجی کاتالوگ برای ورود به ووکامرس. جزئیات در فایل مهاجرت وردپرس.</p>
          <Button
            onClick={async () => {
              const files = await exportWoo();
              downloadFile("originaly-woo.json", files.json, "application/json");
              downloadFile("originaly-woo.csv", files.csv, "text/csv");
              toast.success("دانلود شد");
            }}
          >
            دانلود JSON و CSV ووکامرس
          </Button>
        </section>
      ) : null}
    </div>
  );
}
