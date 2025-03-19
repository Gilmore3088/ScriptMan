"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"

// Define a constant for the storage key
export const STORAGE_KEY = "scriptman_user"

// Define the User type
export interface User {
  id: string
  email: string
  name?: string
  role?: string
}

// Define the context type
interface UserContextType {
  currentUser: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  currentUser: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
})

// Create a provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        // First try to get the user from localStorage (for development/testing)
        const storedUser = localStorage.getItem(STORAGE_KEY)
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser))
          setIsLoading(false)
          return
        }

        // If no stored user, check Supabase auth
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const user: User = {
            id: data.session.user.id,
            email: data.session.user.email || "",
            // You can fetch additional user data from your database here if needed
          }
          setCurrentUser(user)
          // Store the user in localStorage for development/testing
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        }
      } catch (error) {
        console.error("Error checking user session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // For development/testing, allow a special test account
      if (email === "test@example.com" && password === "password") {
        const testUser: User = {
          id: "test-user-id",
          email: "test@example.com",
          name: "Test User",
          role: "admin",
        }
        setCurrentUser(testUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(testUser))
        return { success: true }
      }

      // Otherwise, use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || "",
          // You can fetch additional user data from your database here if needed
        }
        setCurrentUser(user)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        return { success: true }
      }

      return { success: false, error: "Unknown error occurred" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEY)

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear the user state
      setCurrentUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        console.error("Registration error:", error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Note: In a real app, you might want to wait for email verification
        // before considering the user as logged in
        const user: User = {
          id: data.user.id,
          email: data.user.email || "",
          name,
        }
        setCurrentUser(user)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        return { success: true }
      }

      return { success: false, error: "Unknown error occurred" }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Create the context value
  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    register,
  }

  // Provide the context to children
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Create a custom hook for using the context
export function useUser() {
  return useContext(UserContext)
}

