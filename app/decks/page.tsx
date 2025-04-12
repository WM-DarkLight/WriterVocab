"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeckList } from "@/components/deck-list"
import { useDatabase } from "@/components/database-provider"
import { useToast } from "@/components/ui/use-toast"

export default function DecksPage() {
  const [loading, setLoading] = useState(true)
  const { initialized, db } = useDatabase()
  const { toast } = useToast()

  useEffect(() => {
    // Check if database is initialized
    if (initialized) {
      setLoading(false)
    } else {
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (!initialized) {
          setLoading(false)
          toast({
            title: "Database not ready",
            description:
              "The database is taking longer than expected to initialize. Some features may not work properly.",
            variant: "destructive",
          })
        }
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [initialized, toast])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold">Your Decks</h1>
          <Link href="/decks/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              New Deck
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your decks...</p>
          </div>
        ) : (
          <DeckList />
        )}
      </div>
    </div>
  )
}
