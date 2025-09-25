"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Target, PieChart, BarChart3, Wallet, Shield } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-foreground">BudgetPro</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
                >
                  About
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-foreground hover:text-foreground"
              >
                Log in
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
              >
                Try for free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/30 dark:from-purple-950/20 dark:to-blue-950/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Announcement Banner */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
              <span className="mr-2">New:</span>
              <span>AI-Powered Budget Insights</span>
              <span className="ml-2 text-purple-500">Learn more</span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in-up">
              Smart budgeting
              <br />
              <span className="text-5xl md:text-7xl">for every goal</span>
            </h1>

            <p
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              Take control of your finances with intelligent budget tracking, goal setting, and expense management.
              Built for individuals who want to achieve financial freedom.
            </p>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-4 text-lg font-medium mr-4"
              >
                Try BudgetPro for free
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <p className="text-muted-foreground mb-8">
              Over 50,000 users trust BudgetPro to manage their finances effectively.
            </p>

            {/* Company Logos */}
            <div className="flex justify-center items-center space-x-12 opacity-60">
              <div className="text-2xl font-bold text-muted-foreground">Microsoft</div>
              <div className="text-2xl font-bold text-muted-foreground">Google</div>
              <div className="text-2xl font-bold text-muted-foreground">Apple</div>
              <div className="text-2xl font-bold text-muted-foreground">Netflix</div>
              <div className="text-2xl font-bold text-muted-foreground">Spotify</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              The complete platform to
              <br />
              master your finances.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your toolkit to stop overspending and start saving. Securely track, analyze, and optimize your financial
              habits with BudgetPro.
            </p>
            <div className="flex justify-center space-x-4 mt-8">
              <Button variant="outline" className="rounded-full bg-transparent">
                Get a demo
              </Button>
              <Button variant="ghost" className="rounded-full">
                Explore Features
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">85%</div>
                <div className="text-sm text-muted-foreground mb-2">reduction</div>
                <div className="text-sm text-muted-foreground">in overspending.</div>
                <div className="mt-4">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">92%</div>
                <div className="text-sm text-muted-foreground mb-2">faster</div>
                <div className="text-sm text-muted-foreground">goal achievement.</div>
                <div className="mt-4">
                  <Target className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">200%</div>
                <div className="text-sm text-muted-foreground mb-2">increase</div>
                <div className="text-sm text-muted-foreground">in savings rate.</div>
                <div className="mt-4">
                  <Wallet className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">5x</div>
                <div className="text-sm text-muted-foreground mb-2">better</div>
                <div className="text-sm text-muted-foreground">financial insights.</div>
                <div className="mt-4">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <PieChart className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-600">Analytics</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Faster insights.
                <br />
                Better decisions.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                The platform for rapid financial progress. Let your money work smarter, not harder, with automated
                tracking, intelligent categorization, and predictive budgeting.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-muted-foreground">Bank-level security with 256-bit encryption</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-muted-foreground">Real-time expense tracking and categorization</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-muted-foreground">AI-powered budget recommendations</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm opacity-80">Monthly Budget</span>
                    <span className="text-green-300 text-sm">+15%</span>
                  </div>
                  <div className="text-3xl font-bold mb-2">$3,240</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-3/4"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Saved</div>
                    <div className="text-xl font-bold">$1,240</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Goals</div>
                    <div className="text-xl font-bold">3/5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to take control of your finances?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have transformed their financial habits with BudgetPro.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/register")}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-4 text-lg font-medium"
          >
            Start your free trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}
