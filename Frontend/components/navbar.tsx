"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Building2 } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Profile", href: "/profile" },
    { name: "Feedback", href: "/feedback" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800/5 to-purple-100/5"></div>
      <div className="relative flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-800 to-purple-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
            PropChain
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary relative group ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-800 to-purple-100 transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center space-x-2">
            {typeof window !== "undefined" &&
            localStorage.getItem("isAuthenticated") === "true" ? (
              <div className="relative">
                <Button
                  className="text-sm font-medium dark:text-purple-800 dark:bg-purple-100 hover:dark:bg-purple-300"
                  onClick={() => setIsOpen((prev) => !prev)}
                >
                  {localStorage.getItem("userName") || "User"}
                </Button>
                {isOpen && (
                  <div className="w-full absolute rounded-lg right-0 mt-2 dark:text-purple-800 dark:bg-purple-100 hover:dark:bg-purple-300 shadow-lg z-10">
                    <button
                      className="w-full text-left px-4 py-2 text-sm dark:text-purple-800 dark:bg-purple-100 hover:dark:bg-purple-300"
                      onClick={() => {
                        localStorage.removeItem("isAuthenticated");
                        localStorage.removeItem("userName");
                        localStorage.removeItem("userEmail");
                        window.location.href = "/";
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t border-border">
              {typeof window !== "undefined" &&
              localStorage.getItem("isAuthenticated") === "true" ? (
                <div className="relative">
                  <Button
                    className="text-sm font-medium dark:text-purple-800 dark:bg-purple-100 hover:dark:bg-purple-300"
                    onClick={() => setIsOpen((prev) => !prev)}
                  >
                    {localStorage.getItem("userName") || "User"}
                  </Button>
                  {isOpen && (
                    <div className="w-full absolute rounded-lg right-0 mt-2 dark:text-purple-800 dark:bg-purple-100 hover:dark:bg-purple-300 shadow-lg z-10">
                      <button
                        className="w-full text-left px-4 py-2 text-sm dark:text-purple-800 dark:bg-purple-100 hover:dark:bg-purple-300"
                        onClick={() => {
                          localStorage.removeItem("isAuthenticated");
                          localStorage.removeItem("userName");
                          localStorage.removeItem("userEmail");
                          window.location.href = "/";
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                  >
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
