import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from '@/contexts/WalletContext';
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PropChain - Blockchain Real Estate Platform",
  description: "Revolutionizing Property Ownership with Blockchain Technology",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
         <WalletProvider>
          {children}
        </WalletProvider>   
        </ThemeProvider>
      </body>
    </html>
  )
}
