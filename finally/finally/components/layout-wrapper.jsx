"use client"

import { usePathname } from "next/navigation"
import Navbar from "./navbar"
import ProtectedRoute from "./protected-route"

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/"

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
