import { useState, type PointerEvent } from "react";
import { Focus, X } from "lucide-react";

export function ProductFocusLens({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState({ x: 50, y: 50 });

  function moveFocus(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && !open) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPoint({ x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) });
  }

  return (
    <div
      className="product-focus-lens product-stage relative aspect-[4/5] select-none overflow-hidden rounded-[28px] bg-subtle"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false);
      }}
      onPointerMove={moveFocus}
      onPointerDown={(event) => {
        if (event.pointerType === "touch") {
          setOpen(true);
          moveFocus(event);
        }
      }}
      style={{ touchAction: open ? "none" : "pan-y" }}
      aria-label="نمایش جزئیات تصویر محصول"
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-cover"
      />
      {open ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 size-40 overflow-hidden rounded-2xl border-2 border-primary shadow-[0_0_0_1px_rgba(8,9,13,.8),0_12px_45px_rgba(196,255,44,.3)] sm:size-48"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            transform: "translate(-50%, -50%)",
            backgroundImage: `url("${src.replaceAll('"', "%22")}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "250% 250%",
            backgroundPosition: `${point.x}% ${point.y}%`,
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet/10" />
          <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20" />
        </div>
      ) : null}
      <button
        type="button"
        className="absolute bottom-4 left-4 z-20 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-bg/80 px-4 text-xs font-semibold text-fg shadow-lg backdrop-blur transition hover:border-primary/70"
        aria-pressed={open}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-4 text-primary" /> : <Focus className="size-4 text-primary" />}
        {open ? "بستن ذره‌بین" : "لمس یا مکث برای فوکوس"}
      </button>
      {open ? (
        <p className="pointer-events-none absolute bottom-[4.25rem] left-4 z-20 rounded-full bg-bg/75 px-3 py-1 text-[10px] text-muted backdrop-blur">
          روی تصویر بکشید تا جزئیات را دنبال کنید
        </p>
      ) : null}
      <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/15 bg-bg/65 px-3 py-1 text-[10px] text-fg backdrop-blur">
        DETAIL LENS
      </span>
    </div>
  );
}
