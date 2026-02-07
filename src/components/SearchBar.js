'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ placeholder = 'Enter any wallet address (0x...)' }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    // Basic validation
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      router.push(`/wallet?address=${trimmed}`);
    } else {
      alert('Please enter a valid Ethereum address (0x...)');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <span className="absolute left-4 text-xl">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-4 rounded-xl mono text-sm outline-none transition-all"
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
        />
        <button type="submit" className="btn-primary absolute right-2 text-sm px-5 py-2">
          Analyze
        </button>
      </div>
    </form>
  );
}
