import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { listProducts, type ProductRow } from "@/lib/store";
import { canPurchaseProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const QUICK_QUESTIONS = ["سایز هر کالا چطور است؟", "هزینهٔ ارسال چطور محاسبه می‌شود؟", "پرداخت آنلاین فعال است؟"];

type Message = {
  id: string;
  from: "assistant" | "customer";
  text: string;
  products?: ProductRow[];
};

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(text: string) {
  return text.toLocaleLowerCase("fa").replace(/[\u200c\s]+/g, " ").trim();
}

function responseFor(question: string, catalog: ProductRow[]) {
  const q = normalize(question);
  const available = catalog.filter(canPurchaseProduct);

  if (/ارسال|پست|پیک|حمل/.test(q)) {
    return {
      text: "هزینهٔ حمل جدا از جمع کالاهاست و به‌صورت پس‌کرایه هنگام تحویل توسط شرکت حمل دریافت می‌شود؛ مبلغ ثابت یا ارسال رایگان اعلام نمی‌کنیم.",
    };
  }
  if (/سایز|اندازه/.test(q)) {
    return {
      text: "برای هر کالای قابل سفارش فقط یک سایزِ ثبت‌شده وجود دارد. سایز همان موجودی در صفحهٔ محصول نمایش داده می‌شود و گزینهٔ چندسایزی نداریم.",
    };
  }
  if (/پرداخت|زرین|کارت به کارت|کارت‌به‌کارت/.test(q)) {
    return {
      text: "درگاه زرین‌پال تا تکمیل اتصال واقعی و آزمون پاسخ/بازگشت پرداخت غیرفعال است. اگر روش دستی پرداخت روی سایت پیکربندی نشده باشد، سفارش نهایی هم ثبت نمی‌شود.",
    };
  }
  if (/مرجوع|بازگشت|تعویض|اصالت|اصل بودن|گارانتی/.test(q)) {
    return {
      text: "برای این مورد هنوز سیاست نهایی و قابل استناد در فروشگاه ثبت نشده است؛ لطفاً پیش از خرید، از مالک فروشگاه تأیید بگیرید. من وعدهٔ مرجوعی یا اصالت‌سنجیِ تأییدنشده نمی‌دهم.",
    };
  }

  const terms = q.split(/[^\p{L}\p{N}.]+/u).filter((term) => term.length > 1 && !["قیمت", "دارید", "موجود", "کفش", "محصول", "دنبال", "میگردم", "می‌گردم", "برای", "میخواهم", "می‌خواهم"].includes(term));
  const scored = catalog.map((product) => {
    const text = normalize(`${product.brand} ${product.nameFa} ${product.nameEn} ${product.subcategory} ${product.sizes}`);
    const score = terms.reduce((sum, term) => sum + (text.includes(term) ? 2 : 0), 0)
      + (q.includes(normalize(product.brand)) ? 4 : 0)
      + (q.includes(normalize(product.nameEn)) ? 4 : 0);
    return { product, score };
  }).filter(({ score }) => score > 0);

  if (scored.length) {
    const matches = scored
      .sort((a, b) => Number(b.product.stock > 0) - Number(a.product.stock > 0) || b.score - a.score)
      .slice(0, 3)
      .map(({ product }) => product);
    const products = matches.filter(canPurchaseProduct);
    if (products.length === 0 && matches.every((product) => product.catalogStatus === "under_review")) {
      return {
        text: "این کالا از فهرست قبلی حذف نشده است، اما نام/مدل و مشخصاتش نیازمند بازبینی است؛ فعلاً ناموجود است و امکان سفارش ندارد:",
        products: matches,
      };
    }
    const outOfStock = products.length === 0;
    return {
      text: outOfStock
        ? "این تطبیق در کاتالوگ هست، اما فعلاً موجودی قابل سفارش ندارد:"
        : "این کالاها بیشترین تطبیق را با جست‌وجوی شما دارند؛ قیمت و سایز از کاتالوگ فعلی خوانده شده است:",
      products: products.length ? products : matches,
    };
  }

  const recommendations = available
    .filter((product) => product.stock > 0)
    .slice(-3)
    .reverse();
  if (recommendations.length && /پیشنهاد|چی بخر|چه بخریم|محصول/.test(q)) {
    return { text: "چند کالای موجود از کاتالوگ تأییدشده؛ هرکدام یک سایز ثابت دارند:", products: recommendations };
  }
  return {
    text: "برای اینکه دقیق پیشنهاد بدهم، نام برند یا مدل، حدود قیمت یا نوع استفاده‌تان را بنویسید. من فقط از کالاهای دارای قیمت و سایز ثبت‌شده پیشنهاد می‌دهم.",
  };
}

export function AssistantDock() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [catalog, setCatalog] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", from: "assistant", text: "سلام؛ من راهنمای کاتالوگ اورجینالی هستم. دربارهٔ برند، مدل، قیمت، سایز ثابت یا ارسال بپرسید." },
  ]);

  useEffect(() => {
    let active = true;
    void listProducts({ data: {} }).then((products) => {
      if (active) setCatalog(products);
    }).catch(() => {
      if (active) setCatalog([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const stockCount = useMemo(() => catalog.filter(canPurchaseProduct).length, [catalog]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    const reply = responseFor(value, catalog);
    setMessages((previous) => [
      ...previous,
      { id: id(), from: "customer", text: value },
      { id: id(), from: "assistant", ...reply },
    ]);
    setQuestion("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(question);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40" dir="rtl">
      {open ? (
        <section className="glass mb-3 flex h-[min(72vh,560px)] w-[min(92vw,390px)] flex-col overflow-hidden rounded-3xl border border-primary/20 shadow-[0_20px_70px_rgba(0,0,0,.55)]" aria-label="دستیار فروشگاه">
          <header className="flex items-center gap-3 border-b border-border bg-bg/70 p-4">
            <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">راهنمای Originaly</p>
              <p className="mt-0.5 text-[10px] text-muted">{loading ? "در حال بارگذاری کاتالوگ…" : `${stockCount} کالای تأییدشده در موجودی`}</p>
            </div>
            <button type="button" className="grid size-9 place-items-center rounded-full border border-border" aria-label="بستن راهنما" onClick={() => setOpen(false)}><X className="size-4" /></button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={message.from === "customer" ? "mr-auto max-w-[88%]" : "ml-auto max-w-[96%]"}>
                <p className={message.from === "customer" ? "rounded-2xl rounded-bl-sm bg-primary px-3 py-2.5 text-xs leading-6 text-primary-fg" : "rounded-2xl rounded-br-sm border border-border bg-bg/70 px-3 py-2.5 text-xs leading-6 text-fg"}>
                  {message.text}
                </p>
                {message.products?.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {message.products.map((product) => (
                      <div key={product.id} className="overflow-hidden rounded-2xl border border-border bg-bg/80 text-[10px]">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? <p className="text-xs text-muted">در حال دریافت فهرست محصولات…</p> : null}
          </div>

          <div className="border-t border-border p-3">
            {messages.length <= 1 ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((prompt) => (
                  <button key={prompt} type="button" className="rounded-full border border-border px-2.5 py-1.5 text-[10px] text-muted transition hover:border-primary/50 hover:text-fg" onClick={() => send(prompt)}>{prompt}</button>
                ))}
              </div>
            ) : null}
            <form onSubmit={submit} className="flex items-center gap-2">
              <input value={question} onChange={(event) => setQuestion(event.target.value)} className="h-11 min-w-0 flex-1 rounded-full border border-border bg-bg px-4 text-xs outline-none focus:border-primary/60" placeholder="برند، مدل یا پرسش…" aria-label="پرسش از دستیار" />
              <button type="submit" disabled={!question.trim()} className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-fg disabled:opacity-50" aria-label="ارسال پرسش"><Send className="size-4" /></button>
            </form>
            <p className="mt-2 text-center text-[9px] leading-4 text-faint">راهنمای کاتالوگ؛ پاسخ‌ها بر پایهٔ اطلاعات ثبت‌شده‌اند و گفت‌وگو ذخیره نمی‌شود.</p>
          </div>
        </section>
      ) : null}
      <button type="button" onClick={() => setOpen((value) => !value)} className="mr-auto flex h-12 items-center gap-2 rounded-full border border-primary/30 bg-bg/90 px-4 text-sm font-bold text-primary shadow-[0_8px_36px_rgba(196,255,44,.18)] backdrop-blur transition hover:-translate-y-0.5 hover:border-primary" aria-expanded={open} aria-label={open ? "بستن راهنمای فروشگاه" : "بازکردن راهنمای فروشگاه"}>
        {open ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        راهنمای فروشگاه
      </button>
    </div>
  );
}
