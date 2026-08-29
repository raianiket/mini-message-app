import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()
const STORAGE_KEY = 'mini-message-theme'

const getSystemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system')
    const [resolvedTheme, setResolvedTheme] = useState(() => (theme === 'system' ? getSystemTheme() : theme))

    useEffect(() => {
        const applyResolved = () => {
            const resolved = theme === 'system' ? getSystemTheme() : theme
            document.documentElement.setAttribute('data-theme', resolved)
            setResolvedTheme(resolved)
        }
        applyResolved()
        localStorage.setItem(STORAGE_KEY, theme)

        if (theme !== 'system') return
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', applyResolved)
        return () => mediaQuery.removeEventListener('change', applyResolved)
    }, [theme])

    return <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
