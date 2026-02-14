"use client";

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
  const short = walletAddress ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4) : null;

  const getLinkClass = (href) => {
    const baseHref = href.split("?")[0];
    const isActive = href === "/" 
      ? pathname === "/" 
      : pathname.startsWith(baseHref);
    
    if (isActive) {
      return "px-3 py-2 rounded-lg text-sm font-medium transition-all text-[--accent] bg-[--accent-dim]";
    }
    return "px-3 py-2 rounded-lg text-sm font-medium transition-all text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated]";
  };

  const getButtonClass = () => {
    if (walletAddress) {
      return "ml-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all bg-[rgba(16,185,129,0.12)] text-[--green] border border-[rgba(16,185,129,0.2)]";
    }
    return "ml-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all bg-[--accent] text-[--bg-primary] hover:brightness-110";
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 border-b border-[--border] bg-[--bg-primary]/90 backdrop-blur-xl">
      <Link href="/" className="font-mono font-bold text-lg tracking-tight bg-gradient-to-r from-[--accent] to-sky-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
        WalletStory
      </Link>
      <div className="flex items-center gap-2">
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
    </nav>
  );
}
