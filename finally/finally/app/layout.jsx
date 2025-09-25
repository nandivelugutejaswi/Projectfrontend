import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import LayoutWrapper from "@/components/layout-wrapper"
import "./globals.css"

export const metadata = {
  title: "BudgetPro - Smart Budget Planning",
  description: "Take control of your finances with intelligent budget tracking, goal setting, and expense management.",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
