"use client"

import type React from "react"
import Header from "./header"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Map, Building2, Store, Package, MessageSquare } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [companyName, setCompanyName] = useState<string>("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")
    const company = localStorage.getItem("companyName")

    if (!role || !email) {
      router.push("/auth/login")
      return
    }

    setUserRole(role)
    setUserEmail(email)
    setCompanyName(company || "")
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Map View", href: "/map", icon: Map },
    { name: "Verified Warehouses", href: "/warehouses", icon: Building2 },
    { name: "Marketplace", href: "/marketplace", icon: Store },
    ...(userRole === "exporter" ? [{ name: "Product Listing", href: "/product-listing", icon: Package }] : []),
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
  ]

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? "w-full" : "w-64"} bg-card border-r border-border h-full flex flex-col`}>
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">BlockTrade</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {userRole === "exporter" ? "Exporter Portal" : "Importer Portal"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )

  if (!userRole) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
