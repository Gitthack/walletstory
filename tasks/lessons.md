# Lessons Learned

## Session Rules
1. Always read files before modifying — never assume content
2. Etherscan V1 API is deprecated; always use V2 with `chainid` param
3. Node.js `fetch` may not resolve DNS in sandboxed environments — test with `curl` first
4. Next.js production builds cache env vars differently than dev — test both modes
5. When adding new libs, keep zero external dependencies if possible (this repo has no ORM, no DB driver)
6. Don't break existing flows — always ensure backward compat by keeping old API routes working
