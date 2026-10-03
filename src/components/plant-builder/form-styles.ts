// Shared form styling for Plant Builder dialogs.
//
// Static theme: no dark/light variants, explicit GreenEarthX colours. The shadcn
// semantic tokens (ring / border-input / accent / primary) are undefined in this
// app, so focus rings, outline-button states and brand fills are set explicitly.

export const inputClass =
  "h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#0F766E]/30 focus-visible:border-[#0F766E]";
export const textareaClass =
  "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#0F766E]/30 focus-visible:border-[#0F766E]";
export const triggerClass =
  "h-11 bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] data-[state=open]:border-[#0F766E]";
export const contentClass = "bg-white border-slate-200 text-slate-900";
export const outlineBtnClass =
  "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900";
export const primaryBtnClass =
  "bg-[#0F766E] hover:bg-[#0C5F59] text-white min-w-[140px] shadow-sm transition-colors";
/** Brand-tinted outline button, used for secondary header actions. */
export const brandOutlineBtnClass =
  "border-[#0F766E] bg-white text-[#0F766E] hover:bg-[#0F766E]/10 hover:text-[#0C5F59]";
export const dialogHeaderClass =
  "bg-gradient-to-br from-[#0F766E] to-[#15936B] px-6 py-5";
