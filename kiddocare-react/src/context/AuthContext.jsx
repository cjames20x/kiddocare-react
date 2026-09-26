import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('kiddocare-logged-in') === 'true'
  )
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kiddocare-user')
    return saved ? JSON.parse(saved) : null
  })

  function login(profile) {
    localStorage.setItem('kiddocare-logged-in', 'true')
    setIsLoggedIn(true)
    if (profile) {
      localStorage.setItem('kiddocare-user', JSON.stringify(profile))
      setUser(profile)
    }
  }

  function logout() {
    localStorage.removeItem('kiddocare-logged-in')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
