"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/utils/auth"

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)
      setIsLoading(false)

      if (!authenticated) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuth) {
    return null
  }

  return <>{children}</>
}
