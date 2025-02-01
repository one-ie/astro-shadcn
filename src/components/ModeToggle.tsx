import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const [theme, setThemeState] = React.useState<"theme-light" | "dark">("dark")

    React.useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains("dark")
        if (!isDarkMode) {
            document.documentElement.classList.add("dark")
        }
        setThemeState(isDarkMode ? "dark" : "theme-light")
    }, [])

    React.useEffect(() => {
        const isDark = theme === "dark"
        document.documentElement.classList[isDark ? "add" : "remove"]("dark")
    }, [theme])

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-[50px] w-[50px]"
            onClick={() => setThemeState(theme === "dark" ? "theme-light" : "dark")}
        >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    )
}
