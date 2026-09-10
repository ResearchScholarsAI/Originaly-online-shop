import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guide")({ component: Guide });

const shoes = [
  ["۳۷", "۴", "۶"],
  ["۳۸", "۵", "۷"],
  ["۳۹", "۶", "۸"],
  ["۴۰", "۷", "۹"],
  ["۴۱", "۸", "۱۰"],
  ["۴۲", "۹", "۱۱"],
  ["۴۳", "۱۰", "۱۲"],
  ["۴۴", "۱۱", "۱۳"],
  ["۴۵", "۱۲", "۱۴"],
];

const apparel = [
  ["S", "۴۸–۵۰", "۸۸–۹۲"],
  ["M", "۵۲–۵۴", "۹۶–۱۰۰"],
  ["L", "۵۶–۵۸", "۱۰۴–۱۰۸"],
  ["XL", "۶۰–۶۲", "۱۱۲–۱۱۶"],
  ["XXL", "۶۴–۶۶", "۱۲۰–۱۲۴"],
];

function Guide() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="eyebrow">FIT / GUIDE</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">راهنمای سایز</h1>
      <p className="mt-3 max-w-lg text-sm leading-7 text-muted">
        اندازه‌ها تقریبی‌اند. اگر بین دو سایز هستید، برای کفش سایز بالاتر و برای پوشاک فیت آزاد را انتخاب کنید.
      </p>

      <section className="stage-lift mt-10 overflow-hidden rounded-2xl bg-elevated">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-bold">کفش — EU / UK / US</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-faint">
            <tr>
              <th className="px-5 py-3 text-right font-medium">EU</th>
              <th className="px-5 py-3 text-right font-medium">UK</th>
              <th className="px-5 py-3 text-right font-medium">US</th>
            </tr>
          </thead>
          <tbody>
            {shoes.map((r) => (
              <tr key={r[0]} className="border-t border-border">
                {r.map((c) => (
                  <td key={c} className="px-5 py-3 tabular-nums">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="stage-lift mt-6 overflow-hidden rounded-2xl bg-elevated">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-bold">پوشاک — دور سینه (سانتی‌متر)</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-faint">
            <tr>
              <th className="px-5 py-3 text-right font-medium">سایز</th>
              <th className="px-5 py-3 text-right font-medium">ایران</th>
              <th className="px-5 py-3 text-right font-medium">سینه</th>
            </tr>
          </thead>
          <tbody>
            {apparel.map((r) => (
              <tr key={r[0]} className="border-t border-border">
                {r.map((c) => (
                  <td key={c} className="px-5 py-3 tabular-nums">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
