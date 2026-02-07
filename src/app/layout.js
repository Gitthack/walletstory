import './globals.css';

export const metadata = {
  title: 'WalletStory — On-Chain Wallet Intelligence',
  description: 'Analyze any blockchain wallet. Discover archetypes, scores, and stories. Powered by BSC smart contracts.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
