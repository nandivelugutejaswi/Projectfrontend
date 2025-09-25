"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getUsername, logout, isAuthenticated } from "@/utils/auth"

export default function Navbar() {
  const [username, setUsername] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated()) {
      setUsername(getUsername() || "User")
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Budgets", path: "/budgets" },
    { name: "Expenses", path: "/expenses" },
    { name: "Categories", path: "/categories" },
    { name: "Goals", path: "/goals" },
    { name: "Reports", path: "/reports" },
    { name: "Profile", path: "/profile" },
  ]

  if (!mounted || !isAuthenticated()) {
    return null
  }

  return (
    <nav className="glass-effect border-b border-border/50 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Budget Planner
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={pathname === item.path ? "default" : "ghost"}
                className={`hover-lift transition-all duration-300 ${
                  pathname === item.path ? "animate-glow" : "hover:animate-glow"
                }`}
                onClick={() => router.push(item.path)}
              >
                {item.name}
              </Button>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:block">Hello, {username}</span>
            <Button variant="outline" className="hover-lift glass-effect bg-transparent" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={pathname === item.path ? "default" : "ghost"}
                size="sm"
                className={`hover-lift transition-all duration-300 ${
                  pathname === item.path ? "animate-glow" : "hover:animate-glow"
                }`}
                onClick={() => router.push(item.path)}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
