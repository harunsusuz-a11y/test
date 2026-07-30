"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { forwardRef } from "react";

/**
 * Erişilebilir radio grup primitifi (Radix üzerine, Venti-Ate stiliyle).
 * shadcn CLI'nin bileşen kayıt defterine (ui.shadcn.com) bu ortamdan ağ
 * erişimi yoktu; shadcn'in kendisi de aynı Radix primitiflerini stilize
 * ederek üretir — o yüzden aynı temel teknolojiyi doğrudan kullandık.
 * Klavye ile ok tuşlarıyla gezinme, doğru aria-checked/role="radio" ve
 * odak yönetimi Radix tarafından otomatik sağlanır (elle yazılmış
 * `role="radio"` div'lerin aksine).
 */
export const RadioGroup = RadioGroupPrimitive.Root;

export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function RadioGroupItem({ className = "", children, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={`data-[state=checked]:ring-2 data-[state=checked]:ring-green data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-cream ${className}`}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
});
