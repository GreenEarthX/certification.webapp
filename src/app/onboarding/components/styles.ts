// Static theme for the onboarding flow. Explicit colors only — no shadcn
// semantic tokens (bg-popover, bg-primary, …) which are undefined in this
// project and render transparent, and no dark/light adaptation.

export const inputClass =
  "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#0F766E]/40 focus-visible:border-[#0F766E] focus-visible:ring-offset-0";

export const selectTriggerClass =
  "bg-white border-slate-300 text-slate-900 data-[placeholder]:text-slate-400 focus:ring-2 focus:ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-offset-0 data-[state=open]:border-[#0F766E]";

export const selectContentClass =
  "bg-white border border-slate-200 text-slate-900 shadow-lg";

export const selectItemClass =
  "text-slate-900 focus:bg-slate-100 focus:text-slate-900";

export const primaryBtnClass = "bg-[#0F766E] text-white hover:bg-[#0C5F59] shadow-sm";

export const outlineBtnClass =
  "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900";
