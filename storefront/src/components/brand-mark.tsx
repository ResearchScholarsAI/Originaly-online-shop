import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  alt = "Originaly",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/brand/logo-3d.png"
      alt={alt}
      className={cn(
        "object-contain drop-shadow-[0_8px_28px_rgba(196,255,44,0.28)]",
        className,
      )}
    />
  );
}
