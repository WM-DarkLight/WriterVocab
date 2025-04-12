"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, BookOpen, Home, Settings, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="flex h-16 items-center px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
        <Link
          href="/"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <span className="flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Home
          </span>
        </Link>
        <Link
          href="/decks"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/decks" || pathname?.startsWith("/decks/") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <span className="flex items-center">
            <Book className="h-4 w-4 mr-2" />
            My Decks
          </span>
        </Link>
        <Link
          href="/collections"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/collections" || pathname?.startsWith("/collections/")
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          <span className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Collections
          </span>
        </Link>
        <Link
          href="/worddb"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/worddb" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <span className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Word DB
          </span>
        </Link>
        <Link
          href="/settings"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/settings" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <span className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </span>
        </Link>
      </nav>
      <div className="ml-auto flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </div>
  )
}
