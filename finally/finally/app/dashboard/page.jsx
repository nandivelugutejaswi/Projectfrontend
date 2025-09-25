"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getUsername, getAuthHeaders, isAuthenticated, handle403Error } from "@/utils/auth"
import CustomPieChart from "@/components/charts/pie-chart"
import CustomLineChart from "@/components/charts/line-chart"
import CustomBarChart from "@/components/charts/bar-chart"

export default function Dashboard() {
  const [username, setUsername] = useState("")
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
  })
  const [expenses, setExpenses] = useState([])
  const [chartData, setChartData] = useState({
    categoryData: [],
    timelineData: [],
    monthlyData: [],
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      // Wait a bit longer for localStorage to stabilize
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        return
      }

      // Get token directly from localStorage (don't rely on isAuthenticated function)
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      
      console.log("Dashboard auth check:", {
        token: token ? "EXISTS" : "MISSING",
        username: username || "NO USERNAME",
        tokenLength: token ? token.length : 0
      })
      
      // If no token, redirect but DON'T show error message (might be intentional navigation)
      if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
        console.log("No valid token found, redirecting to login")
        router.push("/login")
        return
      }

      // Set username immediately
      setUsername(username || "User")

      try {
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

        // Create auth headers manually to avoid any function dependencies
        const authHeaders = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        
        console.log("Making API calls with token length:", token.length)

        // Fetch budget data
        const budgetResponse = await fetch(`http://localhost:8082/api/budget/?month=${currentMonth}`, {
          headers: authHeaders,
        })

        console.log("Budget response status:", budgetResponse.status)

        // Only handle 403 - don't redirect on other errors
        if (budgetResponse.status === 403) {
          console.log("Budget API returned 403 - token expired")
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        if (budgetResponse.ok) {
          const budget = await budgetResponse.json()
          setBudgetData({
            totalBudget: budget.limitAmount || 0,
            totalSpent: budget.spentAmount || 0,
            remaining: (budget.limitAmount || 0) - (budget.spentAmount || 0),
          })
        }

        // Fetch expenses
        const expensesResponse = await fetch(`http://localhost:8082/api/expenses?month=${currentMonth}`, {
          headers: authHeaders,
        })

        console.log("Expenses response status:", expensesResponse.status)

        // Only handle 403 - don't redirect on other errors
        if (expensesResponse.status === 403) {
          console.log("Expenses API returned 403 - token expired")
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        if (expensesResponse.ok) {
          const expensesData = await expensesResponse.json()
          setExpenses(expensesData || [])
          processChartData(expensesData || [])
        }
        
        console.log("Dashboard data loaded successfully")
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        
        // DON'T redirect on network errors - only show error message
        toast({
          title: "Network Error",
          description: "Failed to load dashboard data. Please check your connection.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Remove dependencies to prevent re-runs

  const processChartData = (expensesData) => {
    // Process category data for pie chart
    const categoryTotals = {}
    expensesData.forEach((expense) => {
      const category = expense.category || "Other"
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
    })

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }))

    // Process timeline data for line chart (last 7 days)
    const timelineData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayExpenses = expensesData.filter((expense) => expense.date === dateStr)
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      timelineData.push({
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
        value: total,
      })
    }

    // Process monthly data for bar chart (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toISOString().slice(0, 7)

      // For demo purposes, we'll use current month data
      // In real app, you'd fetch data for each month
      const monthExpenses = i === 0 ? expensesData : []
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      monthlyData.push({
        name: date.toLocaleDateString("en-US", { month: "short" }),
        value: total,
      })
    }

    setChartData({
      categoryData,
      timelineData,
      monthlyData,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Hello, {username}!
        </h1>
        <p className="text-muted-foreground">Welcome back to your financial dashboard</p>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-effect hover-lift animate-scale-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${budgetData.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month's limit</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spent Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${budgetData.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total expenses</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetData.remaining >= 0 ? "text-green-500" : "text-destructive"}`}>
              ${budgetData.remaining.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {budgetData.remaining < 0 && (
        <Card className="glass-effect border-destructive animate-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-destructive">⚠️</div>
              <div>
                <h3 className="font-semibold text-destructive">Budget Exceeded!</h3>
                <p className="text-sm text-muted-foreground">
                  You've exceeded your budget by ${Math.abs(budgetData.remaining).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect hover-lift">
          <CardContent className="pt-6">
            {chartData.categoryData.length > 0 ? (
              <CustomPieChart data={chartData.categoryData} title="Spending by Category" />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>No expense data available</p>
                  <p className="text-sm">Add some expenses to see the breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="pt-6">
            <CustomLineChart data={chartData.timelineData} title="Expenses Over Time (Last 7 Days)" />
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect hover-lift">
        <CardContent className="pt-6">
          <CustomBarChart data={chartData.monthlyData} title="Monthly Spending Trend" />
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg glass-effect hover-lift">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-lg font-semibold text-destructive">${expense.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No expenses recorded yet</p>
              <p className="text-sm">Start tracking your spending to see insights here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle>Spending Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {budgetData.totalBudget > 0 ? Math.round((budgetData.totalSpent / budgetData.totalBudget) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    budgetData.totalSpent > budgetData.totalBudget ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.min(
                      budgetData.totalBudget > 0 ? (budgetData.totalSpent / budgetData.totalBudget) * 100 : 0,
                      100,
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
                <span className="font-semibold">{expenses.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average per Transaction</span>
                <span className="font-semibold">
                  ${expenses.length > 0 ? (budgetData.totalSpent / expenses.length).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
