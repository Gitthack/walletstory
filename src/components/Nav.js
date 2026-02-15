"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/trending", label: "Trending" },
  { href: "/market", label: "三国市" },
  { href: "/gamefi?tab=map", label: "三国" },
];

export default function Nav({ walletAddress, onConnect }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const short = walletAddress ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4) : null;

  const getLinkClass = (href, mobile = false) => {
    const baseHref = href.split("?")[0];
    const isActive = href === "/"
      ? pathname === "/"
      : pathname.startsWith(baseHref);

    if (mobile) {
      if (isActive) {
        return "block px-4 py-3 rounded-xl text-sm font-medium text-[--accent] bg-[--accent-dim]";
      }
      return "block px-4 py-3 rounded-xl text-sm font-medium text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-colors";
    }

    if (isActive) {
      return "px-3 py-2 rounded-lg text-sm font-medium transition-all text-[--accent] bg-[--accent-dim]";
    }
    return "px-3 py-2 rounded-lg text-sm font-medium transition-all text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated]";
  };

  const getButtonClass = (mobile = false) => {
    const base = mobile
      ? "w-full px-4 py-3 rounded-xl text-sm font-mono font-semibold transition-all"
      : "ml-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all";

    if (walletAddress) {
      return `${base} bg-[rgba(16,185,129,0.12)] text-[--green] border border-[rgba(16,185,129,0.2)]`;
    }
    return `${base} bg-[--accent] text-[--bg-primary] hover:brightness-110`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[--border] bg-[--bg-primary]/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-3">
        <Link href="/" className="font-mono font-bold text-lg tracking-tight bg-gradient-to-r from-[--accent] to-sky-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity shrink-0">
          WalletStory
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClass(item.href)}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={onConnect}
            className={getButtonClass()}
          >
            {walletAddress ? "🟢 " + short : "Connect Wallet"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-[--bg-elevated] transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-[--text-secondary] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[--text-secondary] mt-1 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[--text-secondary] mt-1 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[--border] px-4 py-3 space-y-1 bg-[--bg-primary]/95 backdrop-blur-xl fade-in">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClass(item.href, true)}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => { onConnect(); setMenuOpen(false); }}
            className={getButtonClass(true)}
          >
            {walletAddress ? "🟢 " + short : "Connect Wallet"}
          </button>
        </div>
      )}
    </nav>
  );
}
