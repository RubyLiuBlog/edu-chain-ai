import "@coinbase/onchainkit/styles.css";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import {
  Avatar,
  Name,
  Identity,
  Address,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
  description:
    "Generated by `create-onchain`, a Next.js template for OnchainKit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    { label: "My targets", href: "/target/list" },
    { label: "NFT Gallery", href: "/nft/gallery" },
    { label: "NFT Market", href: "/nft/market" },
  ];

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 dark">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600"></div>
                    <span className="font-bold text-xl">EduChain AI</span>
                  </Link>
                  <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <div className="wallet-container">
                    <Wallet>
                      <ConnectWallet>
                        <Avatar className="h-6 w-6" />
                        <Name />
                      </ConnectWallet>
                      <WalletDropdown>
                        <Identity
                          className="px-4 pt-3 pb-2"
                          hasCopyAddressOnClick
                        >
                          <Avatar />
                          <Name />
                          <Address />
                          <EthBalance />
                        </Identity>
                        <WalletDropdownLink
                          icon="wallet"
                          href="https://keys.coinbase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Wallet
                        </WalletDropdownLink>
                        <WalletDropdownDisconnect />
                      </WalletDropdown>
                    </Wallet>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6">
              {children}
            </main>

            <footer className="border-t border-slate-800 bg-slate-950">
              <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">关于我们</h3>
                    <p className="text-slate-400">EduChain AI is a</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">快速链接</h3>
                    <ul className="space-y-2">
                      {navItems.map((item, index) => (
                        <li key={index}>
                          <Link
                            href={item.href}
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">联系我们</h3>
                    <p className="text-slate-400">
                      如有任何问题或建议，请通过以下方式与我们联系
                    </p>
                    <p className="text-slate-400 mt-2">
                      邮箱: support@educhainai.example
                    </p>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-800 text-center">
                  <p className="text-sm text-slate-500">
                    © {new Date().getFullYear()} EduChain.ai 保留所有权利
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
