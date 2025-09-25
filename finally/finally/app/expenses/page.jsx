"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders, handle403Error } from "@/utils/auth"
import CustomPieChart from "@/components/charts/pie-chart"
import CustomBarChart from "@/components/charts/bar-chart"

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [categories, setCategories] = useState([])
  const [chartData, setChartData] = useState({
    categoryData: [],
    dailyData: [],
  })
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    setSelectedMonth(currentMonth)
    setFormData({
      ...formData,
      date: new Date().toISOString().split("T")[0],
    })
  }, [])

  useEffect(() => {
    if (selectedMonth) {
      fetchExpenses(selectedMonth)
    }
  }, [selectedMonth])

  useEffect(() => {
    processChartData(filteredExpenses)
  }, [filteredExpenses])

  const fetchExpenses = async (month) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8082/api/expenses?month=${month}`, {
        headers: getAuthHeaders(),
      })

      if (response.status === 403) {
        handle403Error(toast, router)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setExpenses(data || [])
        setFilteredExpenses(data || [])

        // Extract unique categories
        const uniqueCategories = [...new Set((data || []).map((expense) => expense.category).filter(Boolean))]
        setCategories(uniqueCategories)
      } else {
        setExpenses([])
        setFilteredExpenses([])
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

    // Process daily data for bar chart
    const dailyTotals = {}
    expensesData.forEach((expense) => {
      const date = new Date(expense.date).getDate()
      const day = `Day ${date}`
      dailyTotals[day] = (dailyTotals[day] || 0) + expense.amount
    })

    const dailyData = Object.entries(dailyTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number.parseInt(a.name.split(" ")[1]) - Number.parseInt(b.name.split(" ")[1]))

    setChartData({
      categoryData,
      dailyData,
    })
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value,
    })
  }

  const handleMonthChange = (value) => {
    setSelectedMonth(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const expenseData = {
        month: formData.date.slice(0, 7), // Extract YYYY-MM from date
        description: formData.description,
        amount: amount,
        category: formData.category,
        date: formData.date,
      }

      const response = await fetch("http://localhost:8082/api/expenses", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(expenseData),
      })

      if (response.status === 403) {
        handle403Error(toast, router)
        return
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: "Expense added successfully",
        })

        // Reset form
        setFormData({
          description: "",
          amount: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
        })

        // Refresh expenses if the added expense is in the current month
        if (expenseData.month === selectedMonth) {
          fetchExpenses(selectedMonth)
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to add expense",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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

  const commonCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Groceries",
    "Gas",
    "Other",
  ]

  const allCategories = [...new Set([...commonCategories, ...categories])].sort()

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Expense Tracking
        </h1>
        <p className="text-muted-foreground">Track and analyze your spending patterns</p>
      </div>

      {/* Month Filter */}
      <Card className="glass-effect hover-lift animate-scale-in">
        <CardHeader>
          <CardTitle>Filter by Month</CardTitle>
          <CardDescription>Select a month to view expenses</CardDescription>
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

      {/* Add Expense Form */}
      <Card className="glass-effect hover-lift animate-scale-in">
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
          <CardDescription>Record a new expense transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Grocery shopping"
                  className="glass-effect focus:animate-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="glass-effect focus:animate-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="glass-effect focus:animate-glow">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="glass-effect focus:animate-glow"
                />
              </div>
            </div>

            <Button type="submit" className="w-full hover-lift animate-glow" disabled={isSubmitting}>
              {isSubmitting ? "Adding Expense..." : "Add Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Charts */}
      {!loading && filteredExpenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-effect hover-lift">
            <CardContent className="pt-6">
              <CustomPieChart data={chartData.categoryData} title="Spending by Category" />
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardContent className="pt-6">
              <CustomBarChart data={chartData.dailyData} title="Daily Expenses" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses List */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle>
            Expenses for{" "}
            {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </CardTitle>
          <CardDescription>
            {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? "s" : ""} • Total: $
            {filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredExpenses.length > 0 ? (
            <div className="space-y-3">
              {filteredExpenses
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((expense, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 rounded-lg glass-effect hover-lift animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.category} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-destructive">${expense.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg mb-2">No expenses found</p>
              <p className="text-sm">Add your first expense to start tracking your spending</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      {!loading && filteredExpenses.length > 0 && (
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>Spending insights for the selected month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  ${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{filteredExpenses.length}</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  $
                  {filteredExpenses.length > 0
                    ? (
                        filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) / filteredExpenses.length
                      ).toFixed(2)
                    : "0.00"}
                </div>
                <div className="text-sm text-muted-foreground">Average per Transaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories Used</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
