// Auth utility functions
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

export const getUsername = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("username")
  }
  return null
}

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false
  
  const token = localStorage.getItem("token")
  const isValid = token && 
                  token !== "null" && 
                  token !== "undefined" && 
                  token.trim() !== "" && 
                  token.length > 10 // JWT tokens are much longer
  
  console.log("isAuthenticated check:", {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    isValid
  })
  
  return isValid
}

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
  }
}

export const getAuthHeaders = () => {
  const token = getToken()
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

export const handle403Error = (toast, router) => {
  logout()
  toast({
    title: "Session Expired",
    description: "Please log in again",
    variant: "destructive",
  })
  router.push("/login")
}
