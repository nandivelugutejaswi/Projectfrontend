"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getUsername, getAuthHeaders, logout, isAuthenticated, handle403Error } from "@/utils/auth"

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: "",
    email: "",
  })
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check authentication on page load
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please login to access your profile.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      setLoading(true)
      // Try to fetch user info from backend
      const response = await fetch("http://localhost:8082/api/user/me", {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setUserInfo({
          username: data.username || getUsername() || "User",
          email: data.email || "user@example.com",
        })
      } else {
        // Fallback to localStorage data
        setUserInfo({
          username: getUsername() || "User",
          email: "user@example.com",
        })
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
      // Fallback to localStorage data
      setUserInfo({
        username: getUsername() || "User",
        email: "user@example.com",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditData({ ...userInfo })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData({ username: "", email: "" })
    setIsEditing(false)
  }

  const handleInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!editData.username.trim() || !editData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // For demo purposes, we'll just update the local state
      // In a real app, you'd send this to the backend
      setUserInfo({ ...editData })
      localStorage.setItem("username", editData.username)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <Card className="glass-effect hover-lift animate-scale-in">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View and edit your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                  {userInfo.username.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-effect p-4 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Username</Label>
                  <p className="text-lg font-medium">{userInfo.username}</p>
                </div>

                <div className="glass-effect p-4 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="text-lg font-medium">{userInfo.email}</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleEdit} className="flex-1 hover-lift animate-glow">
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex-1 hover-lift glass-effect bg-transparent"
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                  {editData.username.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={editData.username}
                    onChange={handleInputChange}
                    className="glass-effect focus:animate-glow"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="glass-effect focus:animate-glow"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1 hover-lift animate-glow" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 hover-lift glass-effect bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>Your Budget Planner journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center glass-effect p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <div className="text-sm text-muted-foreground">Member Since</div>
            </div>
            <div className="text-center glass-effect p-4 rounded-lg">
              <div className="text-2xl font-bold text-accent">Active</div>
              <div className="text-sm text-muted-foreground">Account Status</div>
            </div>
            <div className="text-center glass-effect p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-500">Premium</div>
              <div className="text-sm text-muted-foreground">Plan Type</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center glass-effect p-4 rounded-lg">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed recently</p>
              </div>
              <Button variant="outline" size="sm" className="glass-effect bg-transparent hover-lift">
                Change
              </Button>
            </div>

            <div className="flex justify-between items-center glass-effect p-4 rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm" className="glass-effect bg-transparent hover-lift">
                Enable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
