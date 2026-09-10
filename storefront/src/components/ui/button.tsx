import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-[transform,background-color,opacity,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-[0_12px_36px_rgba(196,255,44,.16)] hover:shadow-[0_18px_42px_rgba(196,255,44,.24)]",
        ghost: "bg-transparent text-fg hover:bg-subtle",
        outline: "border border-border bg-transparent hover:border-primary/50 hover:bg-primary/10",
        danger: "bg-danger text-bg hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-full",
        md: "h-11 px-4 text-sm rounded-full",
        lg: "h-12 px-5 text-base rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
