import React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-2xl border border-[rgba(255,120,50,0.18)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[#EDEDED] placeholder:text-[rgba(237,237,237,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,140,66,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
