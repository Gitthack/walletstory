"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ size = "lg", onSearch }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addr = input.trim();
    if (!addr) return;

    if (onSearch) {
      setLoading(true);
      await onSearch(addr);
      setLoading(false);
    } else {
      router.push(`/wallet?address=${encodeURIComponent(addr)}`);
    }
  };

  const isLg = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[600px] mx-auto">
      <div
        className={`flex items-center gap-0 bg-[--bg-card] border border-[--border] rounded-2xl transition-colors focus-within:border-[--accent] ${
          isLg ? "p-1.5" : "p-1"
        }`}
      >
        <span className="pl-4 pr-2 text-[--text-muted] text-xl">⌕</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter wallet address (0x...)"
          spellCheck={false}
          autoComplete="off"
          className={`flex-1 bg-transparent border-none outline-none font-mono text-[--text-primary] placeholder:text-[--text-muted] placeholder:font-body min-w-0 ${
            isLg ? "text-sm py-3 px-2" : "text-xs py-2 px-2"
          }`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`bg-[--accent] text-[--bg-primary] border-none rounded-xl font-semibold font-body cursor-pointer transition-all whitespace-nowrap hover:brightness-110 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-default ${
            isLg ? "px-6 py-2.5 text-sm" : "px-4 py-2 text-xs"
          }`}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-[--bg-primary]/30 border-t-[--bg-primary] rounded-full animate-spin" />
          ) : (
            "Analyze"
          )}
        </button>
      </div>
    </form>
  );
}
