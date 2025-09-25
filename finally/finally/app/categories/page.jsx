"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAuthHeaders } from "@/utils/auth"
import CustomPieChart from "@/components/charts/pie-chart"
import CustomBarChart from "@/components/charts/bar-chart"

export default function CategoriesPage() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedMonth, setSelectedMonth] = useState("")
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState({
    categoryData: [],
    monthlyData: [],
  })

  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    setSelectedMonth(currentMonth)
  }, [])

  useEffect(() => {
    if (selectedMonth) {
      fetchExpenses(selectedMonth)
    }
  }, [selectedMonth])

  useEffect(() => {
    processData(expenses)
  }, [expenses])

  const fetchExpenses = async (month) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8082/api/expenses?month=${month}`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(data || [])
      } else {
        setExpenses([])
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const processData = (expensesData) => {
    // Process category totals
    const categoryTotals = {}
    const categoryTransactions = {}

    expensesData.forEach((expense) => {
      const category = expense.category || "Other"
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
      categoryTransactions[category] = (categoryTransactions[category] || 0) + 1
    })

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      transactions: categoryTransactions[name],
      average: value / categoryTransactions[name],
    }))

    // Sort by spending amount
    categoryData.sort((a, b) => b.value - a.value)

    setCategories(categoryData)

    // Prepare chart data
    const pieChartData = categoryData.map(({ name, value }) => ({ name, value }))
    const barChartData = categoryData.slice(0, 10).map(({ name, value }) => ({ name, value }))

    setChartData({
      categoryData: pieChartData,
      monthlyData: barChartData,
    })
  }

  const generateMonthOptions = () => {
    const options = []
    for (let i = 0; i < 12; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      options.push({ value: monthStr, label: monthName })
    }
    return options
  }

  const handleMonthChange = (value) => {
    setSelectedMonth(value)
  }

  const totalSpent = categories.reduce((sum, category) => sum + category.value, 0)

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Categories
        </h1>
        <p className="text-muted-foreground">Analyze your spending by category</p>
      </div>

      {/* Month Filter */}
      <Card className="glass-effect hover-lift animate-scale-in">
        <CardHeader>
          <CardTitle>Filter by Month</CardTitle>
          <CardDescription>Select a month to view category breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="glass-effect focus:animate-glow max-w-xs">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Charts */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-effect hover-lift">
            <CardContent className="pt-6">
              <CustomPieChart data={chartData.categoryData} title="Spending Distribution" />
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardContent className="pt-6">
              <CustomBarChart data={chartData.monthlyData} title="Top Categories" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : categories.length > 0 ? (
          categories.map((category, index) => (
            <Card
              key={category.name}
              className="glass-effect hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{category.name}</span>
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                </CardTitle>
                <CardDescription>{((category.value / totalSpent) * 100).toFixed(1)}% of total spending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Spent</span>
                    <span className="font-semibold text-destructive">${category.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Transactions</span>
                    <span className="font-semibold">{category.transactions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average</span>
                    <span className="font-semibold text-accent">${category.average.toFixed(2)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(category.value / totalSpent) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-lg mb-2">No categories found</p>
            <p className="text-sm">Add some expenses to see category breakdown</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && categories.length > 0 && (
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle>Category Summary</CardTitle>
            <CardDescription>
              Overview for{" "}
              {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">${totalSpent.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {categories.length > 0 ? categories[0].name : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">Top Category</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  ${categories.length > 0 ? (totalSpent / categories.length).toFixed(2) : "0.00"}
                </div>
                <div className="text-sm text-muted-foreground">Average per Category</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
