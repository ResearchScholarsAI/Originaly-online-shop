import { cn } from "@/lib/utils";

export function chipClass(active?: boolean) {
  return cn(
    "inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-[transform,background-color,font-weight] duration-150",
    active ? "active-chip font-bold" : "border border-border bg-elevated hover:bg-subtle",
  );
}

export function ActiveChip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return <button type="button" className={cn(chipClass(active), className)} {...props} />;
}
