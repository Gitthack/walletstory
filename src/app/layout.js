import "./globals.css";

export const metadata = {
  title: "WalletStory — On-Chain Wallet Intelligence",
  description: "Turn raw wallet activity into clear stories. On-chain proof on BSC Testnet.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
