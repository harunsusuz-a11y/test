"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { forwardRef } from "react";

/**
 * Erişilebilir ilerleme çubuğu (Radix üzerine). Elle yazılmış
 * role="progressbar" div'lerin yerini alır — Radix doğru
 * aria-valuenow/min/max'i otomatik yönetir.
 */
export const Progress = forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(function Progress({ className = "", indicatorClassName = "", value, ...props }, ref) {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={`overflow-hidden rounded-full bg-brown/10 ${className}`}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={`h-full rounded-full bg-green transition-transform duration-500 ease-out ${indicatorClassName}`}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
