"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/utils/auth"

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [budgets, setBudgets] = useState({})
  const [expenses, setExpenses] = useState({})
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    targetAmount: "",
    month: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchGoalsData()
  }, [])

  const fetchGoalsData = async () => {
    try {
      setLoading(true)
      const goalPromises = []
      const budgetData = {}
      const expenseData = {}

      // Fetch data for the next 6 months
      for (let i = 0; i < 6; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() + i)
        const monthStr = date.toISOString().slice(0, 7)

        // Fetch budget data
        const budgetPromise = fetch(`http://localhost:8082/api/budget/?month=${monthStr}`, {
          headers: getAuthHeaders(),
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            budgetData[monthStr] = {
              limitAmount: data.limitAmount || 0,
              spentAmount: data.spentAmount || 0,
            }
          } else {
            budgetData[monthStr] = { limitAmount: 0, spentAmount: 0 }
          }
        })

        // Fetch expense data
        const expensePromise = fetch(`http://localhost:8082/api/expenses?month=${monthStr}`, {
          headers: getAuthHeaders(),
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            expenseData[monthStr] = data || []
          } else {
            expenseData[monthStr] = []
          }
        })

        goalPromises.push(budgetPromise, expensePromise)
      }

      await Promise.all(goalPromises)

      setBudgets(budgetData)
      setExpenses(expenseData)

      // Generate goals based on budget data
      const generatedGoals = Object.entries(budgetData)
        .filter(([month, data]) => data.limitAmount > 0)
        .map(([month, data]) => {
          const date = new Date(month + "-01")
          return {
            id: month,
            month,
            monthName: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            targetAmount: data.limitAmount,
            currentAmount: data.spentAmount,
            description: `Stay within budget for ${date.toLocaleDateString("en-US", { month: "long" })}`,
            progress: data.limitAmount > 0 ? Math.min((data.spentAmount / data.limitAmount) * 100, 100) : 0,
            isAchieved: data.spentAmount <= data.limitAmount,
            remaining: data.limitAmount - data.spentAmount,
          }
        })

      setGoals(generatedGoals)
    } catch (error) {
      console.error("Error fetching goals data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch goals data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleMonthChange = (value) => {
    setFormData({
      ...formData,
      month: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.targetAmount || !formData.month || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const targetAmount = Number.parseFloat(formData.targetAmount)
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid target amount",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create a budget for the selected month (this acts as our goal)
      const response = await fetch(
        `http://localhost:8082/api/budget/?month=${formData.month}&limitAmount=${targetAmount}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      )

      if (response.ok) {
        toast({
          title: "Success",
          description: "Goal created successfully",
        })

        // Reset form
        setFormData({
          targetAmount: "",
          month: "",
          description: "",
        })

        // Refresh goals
        fetchGoalsData()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to create goal",
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
      date.setMonth(date.getMonth() + i)
      const monthStr = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      options.push({ value: monthStr, label: monthName })
    }
    return options
  }

  const CircularProgress = ({ progress, size = 120 }) => {
    const radius = (size - 10) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progress >= 100 ? "#10B981" : progress >= 80 ? "#F59E0B" : "#3B82F6"}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{Math.round(progress)}%</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Financial Goals
        </h1>
        <p className="text-muted-foreground">Set and track your financial objectives</p>
      </div>

      {/* Add Goal Form */}
      <Card className="glass-effect hover-lift animate-scale-in">
        <CardHeader>
          <CardTitle>Create New Goal</CardTitle>
          <CardDescription>Set a spending target for any month</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Goal Description</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Stay within budget"
                  className="glass-effect focus:animate-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  placeholder="Enter target amount"
                  className="glass-effect focus:animate-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Target Month</Label>
                <Select value={formData.month} onValueChange={handleMonthChange}>
                  <SelectTrigger className="glass-effect focus:animate-glow">
                    <SelectValue placeholder="Select month" />
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
            </div>

            <Button type="submit" className="w-full hover-lift animate-glow" disabled={isSubmitting}>
              {isSubmitting ? "Creating Goal..." : "Create Goal"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : goals.length > 0 ? (
          goals.map((goal, index) => (
            <Card
              key={goal.id}
              className={`glass-effect hover-lift animate-scale-in ${
                goal.isAchieved ? "border-green-500/50" : goal.progress >= 80 ? "border-yellow-500/50" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{goal.monthName}</span>
                  {goal.isAchieved && <div className="text-green-500">✓</div>}
                </CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <CircularProgress progress={goal.progress} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target</span>
                    <span className="font-semibold text-primary">${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current</span>
                    <span className="font-semibold text-destructive">${goal.currentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span className={`font-semibold ${goal.remaining >= 0 ? "text-green-500" : "text-destructive"}`}>
                      ${Math.abs(goal.remaining).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="text-center">
                  {goal.isAchieved ? (
                    <div className="text-green-500 text-sm font-medium">Goal Achieved! 🎉</div>
                  ) : goal.progress >= 80 ? (
                    <div className="text-yellow-500 text-sm font-medium">Almost there! 💪</div>
                  ) : (
                    <div className="text-primary text-sm font-medium">Keep going! 🚀</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-lg mb-2">No goals set yet</p>
            <p className="text-sm">Create your first financial goal to start tracking progress</p>
          </div>
        )}
      </div>

      {/* Goals Summary */}
      {!loading && goals.length > 0 && (
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle>Goals Summary</CardTitle>
            <CardDescription>Overview of your financial goal progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{goals.length}</div>
                <div className="text-sm text-muted-foreground">Total Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{goals.filter((g) => g.isAchieved).length}</div>
                <div className="text-sm text-muted-foreground">Achieved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {goals.filter((g) => !g.isAchieved && g.progress >= 80).length}
                </div>
                <div className="text-sm text-muted-foreground">Nearly There</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Average Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
