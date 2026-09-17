"use client";
import type { ButtonHTMLAttributes } from "react";

export function ConfirmButton({
  message,
  onClick,
  ...props
}: { message: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
        onClick?.(event);
      }}
    />
  );
}
