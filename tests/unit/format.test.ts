import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/utils/format";

describe("formatPrice", () => {
  it("TRY para birimi ile doğru formatlar", () => {
    expect(formatPrice(39.9)).toContain("39,90");
    expect(formatPrice(39.9)).toContain("₺");
  });

  it("sıfırı doğru formatlar", () => {
    expect(formatPrice(0)).toContain("0,00");
  });

  it("büyük sayılarda binlik ayraç kullanır", () => {
    expect(formatPrice(1234.5)).toMatch(/1[.,]234,50|1\s?234,50/);
  });
});
