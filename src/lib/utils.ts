import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about the custom scales from tailwind.config.js so a
// caller's `rounded-full` / `shadow-md` still overrides a primitive's
// `rounded-gex-md` / `shadow-gex-sm` default.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{ rounded: ["gex-sm", "gex-md", "gex-lg"] }],
      shadow: [{ shadow: ["gex-sm", "gex-md", "gex-lg"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
