"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAuthHeaders } from "@/utils/auth"
import CustomPieChart from "@/components/charts/pie-chart"
import CustomLineChart from "@/components/charts/line-chart"
import CustomBarChart from "@/components/charts/bar-chart"

export default function ReportsPage() {
  const [reportData, setReportData] = useState({
    budgetVsExpenses: [],
    categoryBreakdown: [],
    expenseTrend: [],
    monthlyComparison: [],
  })
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalSaved: 0,
    avgMonthlySpending: 0,
  })

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const months = selectedPeriod === "6months" ? 6 : selectedPeriod === "12months" ? 12 : 3
      const budgetData = []
      const expenseData = []
      const allExpenses = []

      // Fetch data for the selected period
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStr = date.toISOString().slice(0, 7)
        const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        // Fetch budget data
        try {
          const budgetResponse = await fetch(`http://localhost:8082/api/budget/?month=${monthStr}`, {
            headers: getAuthHeaders(),
          })

          if (budgetResponse.ok) {
            const budget = await budgetResponse.json()
            budgetData.push({
              month: monthName,
              budget: budget.limitAmount || 0,
              spent: budget.spentAmount || 0,
            })
          } else {
            budgetData.push({
              month: monthName,
              budget: 0,
              spent: 0,
            })
          }
        } catch (error) {
          budgetData.push({
            month: monthName,
            budget: 0,
            spent: 0,
          })
        }

        // Fetch expense data
        try {
          const expenseResponse = await fetch(`http://localhost:8082/api/expenses?month=${monthStr}`, {
            headers: getAuthHeaders(),
          })

          if (expenseResponse.ok) {
            const expenses = await expenseResponse.json()
            expenseData.push({
              month: monthName,
              expenses: expenses || [],
            })
            allExpenses.push(...(expenses || []))
          } else {
            expenseData.push({
              month: monthName,
              expenses: [],
            })
          }
        } catch (error) {
          expenseData.push({
            month: monthName,
            expenses: [],
          })
        }
      }

      // Process budget vs expenses data
      const budgetVsExpenses = budgetData.map((item) => ({
        name: item.month,
        Budget: item.budget,
        Spent: item.spent,
      }))

      // Process category breakdown
      const categoryTotals = {}
      allExpenses.forEach((expense) => {
        const category = expense.category || "Other"
        categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
      })

      const categoryBreakdown = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
      }))

      // Process expense trend
      const expenseTrend = expenseData.map((item) => ({
        name: item.month,
        value: item.expenses.reduce((sum, expense) => sum + expense.amount, 0),
      }))

      // Process monthly comparison
      const monthlyComparison = budgetData.map((item) => ({
        name: item.month,
        value: Math.max(0, item.budget - item.spent), // Savings (positive) or overspending (0)
      }))

      setReportData({
        budgetVsExpenses,
        categoryBreakdown,
        expenseTrend,
        monthlyComparison,
      })

      // Calculate summary
      const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0)
      const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
      const totalSaved = Math.max(0, totalBudget - totalSpent)
      const avgMonthlySpending = budgetData.length > 0 ? totalSpent / budgetData.length : 0

      setSummary({
        totalBudget,
        totalSpent,
        totalSaved,
        avgMonthlySpending,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value)
  }

  const MultiBarChart = ({ data, title }) => {
    return (
      <div className="w-full h-80">
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
        <div className="w-full h-full">
          {/* Custom implementation for budget vs expenses */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>
                    Budget: ${item.Budget?.toLocaleString()} | Spent: ${item.Spent?.toLocaleString()}
                  </span>
                </div>
                <div className="flex space-x-1 h-6">
                  <div
                    className="bg-primary rounded"
                    style={{
                      width: `${Math.max((item.Budget / Math.max(...data.map((d) => d.Budget))) * 100, 5)}%`,
                    }}
                  ></div>
                  <div
                    className="bg-destructive rounded"
                    style={{
                      width: `${Math.max((item.Spent / Math.max(...data.map((d) => d.Budget))) * 100, 5)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Financial Reports
        </h1>
        <p className="text-muted-foreground">Comprehensive analysis of your financial data</p>
      </div>

      {/* Period Filter */}
      <Card className="glass-effect hover-lift animate-scale-in">
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Select the time period for your financial analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="glass-effect focus:animate-glow max-w-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect hover-lift animate-scale-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budgeted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${summary.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all months</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${summary.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All expenses</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${summary.totalSaved.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Budget remaining</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">${summary.avgMonthlySpending.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Average spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {!loading && (
        <>
          {/* Budget vs Expenses */}
          <Card className="glass-effect hover-lift">
            <CardContent className="pt-6">
              <MultiBarChart data={reportData.budgetVsExpenses} title="Budget vs Expenses by Month" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card className="glass-effect hover-lift">
              <CardContent className="pt-6">
                {reportData.categoryBreakdown.length > 0 ? (
                  <CustomPieChart data={reportData.categoryBreakdown} title="Spending by Category" />
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

            {/* Expense Trend */}
            <Card className="glass-effect hover-lift">
              <CardContent className="pt-6">
                <CustomLineChart data={reportData.expenseTrend} title="Expense Trend Over Time" />
              </CardContent>
            </Card>
          </div>

          {/* Monthly Savings */}
          <Card className="glass-effect hover-lift">
            <CardContent className="pt-6">
              <CustomBarChart data={reportData.monthlyComparison} title="Monthly Savings" />
            </CardContent>
          </Card>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Insights */}
      {!loading && reportData.budgetVsExpenses.length > 0 && (
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle>Financial Insights</CardTitle>
            <CardDescription>Key observations from your financial data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-effect p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Spending Efficiency</h4>
                  <p className="text-sm text-muted-foreground">
                    You've spent{" "}
                    {summary.totalBudget > 0 ? ((summary.totalSpent / summary.totalBudget) * 100).toFixed(1) : 0}% of
                    your total budget across all months.
                  </p>
                </div>

                <div className="glass-effect p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Top Category</h4>
                  <p className="text-sm text-muted-foreground">
                    {reportData.categoryBreakdown.length > 0
                      ? `${reportData.categoryBreakdown[0]?.name} is your highest spending category`
                      : "No category data available"}
                  </p>
                </div>

                <div className="glass-effect p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Savings Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    {summary.totalBudget > 0
                      ? `You've saved ${((summary.totalSaved / summary.totalBudget) * 100).toFixed(1)}% of your budget`
                      : "Set budgets to track your savings rate"}
                  </p>
                </div>

                <div className="glass-effect p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Consistency</h4>
                  <p className="text-sm text-muted-foreground">
                    Your average monthly spending is ${summary.avgMonthlySpending.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
