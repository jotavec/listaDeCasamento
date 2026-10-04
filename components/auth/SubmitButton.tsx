"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"button">, "type"> & { pendingText?: string };

export function SubmitButton({ children, pendingText = "Aguarde...", disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return <button {...props} type="submit" disabled={pending || disabled} aria-busy={pending}>{pending ? pendingText : children}</button>;
}
