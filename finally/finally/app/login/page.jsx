"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Submitting form with:", formData) // ✅ Debug log
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8082/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const rawText = await response.text() // Get the raw JWT token
        console.log("Raw JWT token:", rawText)

        // The backend returns the JWT token directly, not wrapped in JSON
        const token = rawText.trim()
        
        if (token && token.length > 10) {
          localStorage.setItem("token", token)
          localStorage.setItem("username", formData.username)
          
          console.log("Token stored successfully, length:", token.length)

          toast({
            title: "Login Successful",
            description: "Welcome back!",
          })

          router.push("/dashboard")
        } else {
          toast({
            title: "Login Error",
            description: "Invalid token received from server",
            variant: "destructive",
          })
        }
      } else {
        const errorText = await response.text()
        toast({
          title: "Login Failed",
          description: errorText || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Fetch error:", error) // ✅ Debug log
      toast({
        title: "Connection Error",
        description: "Unable to connect to server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect animate-scale-in hover-lift">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your Budget Planner account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="glass-effect focus:animate-glow"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="glass-effect focus:animate-glow"
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full hover-lift animate-glow" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-primary hover:text-accent transition-colors"
              >
                Register here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
