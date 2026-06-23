// Static theme for the onboarding flow. Explicit colors only — no shadcn
// semantic tokens (bg-popover, bg-primary, …) which are undefined in this
// project and render transparent, and no dark/light adaptation.

export const inputClass =
  "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0";

export const selectTriggerClass =
  "bg-white border-slate-300 text-slate-900 data-[placeholder]:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0";

export const selectContentClass =
  "bg-white border border-slate-200 text-slate-900 shadow-lg";

export const selectItemClass =
  "text-slate-900 focus:bg-slate-100 focus:text-slate-900";

export const primaryBtnClass = "bg-blue-600 text-white hover:bg-blue-700";

export const outlineBtnClass =
  "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900";
