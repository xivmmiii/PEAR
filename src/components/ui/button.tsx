import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "pear" | "charcoal" | "tangerine" | "outline";

export function Button({ variant = "charcoal", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`button button-${variant} ${className}`} {...props} />;
}
