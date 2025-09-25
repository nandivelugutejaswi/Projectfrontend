"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ month: "", limitAmount: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // ✅ Helper to get auth headers with JWT
  const getAuthHeaders = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        return {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      }
    }
    return {
      "Content-Type": "application/json",
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  // Fetch budgets for last 12 months
  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const budgetPromises = []

      for (let i = 0; i < 12; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStr = date.toISOString().slice(0, 7)

        budgetPromises.push(
          fetch(`http://localhost:8082/api/budget/?month=${monthStr}`, {
            headers: getAuthHeaders(),
          }).then(async (response) => {
            if (response.status === 403) {
              throw new Error("Unauthorized access (403). Make sure you are logged in.")
            }
            if (response.ok) {
              const data = await response.json()
              return {
                month: monthStr,
                monthName: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                limitAmount: data.limitAmount || 0,
                spentAmount: data.spentAmount || 0,
                remaining: (data.limitAmount || 0) - (data.spentAmount || 0),
              }
            }
            return {
              month: monthStr,
              monthName: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
              limitAmount: 0,
              spentAmount: 0,
              remaining: 0,
            }
          })
        )
      }

      const budgetData = await Promise.all(budgetPromises)
      setBudgets(budgetData)
    } catch (error) {
      console.error("Error fetching budgets:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch budget data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMonthChange = (value) => {
    setFormData({ ...formData, month: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.month || !formData.limitAmount) {
      toast({ title: "Validation Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    const limitAmount = parseFloat(formData.limitAmount)
    if (isNaN(limitAmount) || limitAmount <= 0) {
      toast({ title: "Validation Error", description: "Please enter a valid budget amount", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `http://localhost:8082/api/budget/?month=${formData.month}&limitAmount=${limitAmount}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      )

      if (response.status === 403) {
        toast({
          title: "Unauthorized",
          description: "You do not have permission to update budgets. Please log in again.",
          variant: "destructive",
        })
        return
      }

      if (response.ok) {
        toast({ title: "Success", description: "Budget updated successfully" })
        setFormData({ month: "", limitAmount: "" })
        fetchBudgets()
      } else {
        const errorData = await response.json()
        toast({ title: "Error", description: errorData.message || "Failed to update budget", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error updating budget:", error)
      toast({ title: "Connection Error", description: "Unable to connect to server", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateMonthOptions = () => {
    const options = []
    for (let i = -6; i <= 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      options.push({
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      })
    }
    return options
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
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Budget Management
        </h1>
        <p className="text-muted-foreground">Set and track your monthly spending limits</p>
      </div>

      {/* Budget Form */}
      <Card className="glass-effect hover-lift animate-scale-in">
        <CardHeader>
          <CardTitle>Add or Update Budget</CardTitle>
          <CardDescription>Set your spending limit for any month</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={formData.month} onValueChange={handleMonthChange}>
                  <SelectTrigger className="glass-effect focus:animate-glow">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="limitAmount">Budget Limit ($)</Label>
                <Input
                  id="limitAmount"
                  name="limitAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limitAmount}
                  onChange={handleInputChange}
                  placeholder="Enter budget amount"
                  className="glass-effect focus:animate-glow"
                />
              </div>
            </div>

            <Button type="submit" className="w-full hover-lift animate-glow" disabled={isSubmitting}>
              {isSubmitting ? "Updating Budget..." : "Set Budget"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Budget List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <Card
            key={budget.month}
            className={`glass-effect hover-lift animate-scale-in ${
              budget.remaining < 0 ? "border-destructive" : budget.limitAmount > 0 ? "border-primary/50" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{budget.monthName}</CardTitle>
              <CardDescription>{budget.limitAmount > 0 ? "Budget set" : "No budget set"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budget.limitAmount > 0 ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Budget Limit</span>
                    <span className="font-semibold text-primary">${budget.limitAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span className="font-semibold text-destructive">${budget.spentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span className={`font-semibold ${budget.remaining >= 0 ? "text-green-500" : "text-destructive"}`}>
                      ${budget.remaining.toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No budget set for this month</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 glass-effect bg-transparent hover-lift"
                    onClick={() => {
                      setFormData({ month: budget.month, limitAmount: "" })
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                  >
                    Set Budget
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
