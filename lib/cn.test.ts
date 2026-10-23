import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy class names and filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });
});

