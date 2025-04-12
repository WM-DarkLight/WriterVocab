"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useDatabase } from "@/components/database-provider"
import { FlashcardList } from "@/components/flashcard-list"

export default function DeckPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getDeck, exportDeck, db } = useDatabase()
  const [deck, setDeck] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const deckId = params.id as string

  useEffect(() => {
    const loadDeck = async () => {
      try {
        // Wait for database to be initialized
        if (!db) {
          console.log("Database not yet initialized, waiting...")
          return
        }

        console.log("Loading deck with ID:", deckId)
        const deckData = await getDeck(deckId)

        if (!deckData) {
          console.error("Deck not found:", deckId)
          setError("The requested deck could not be found.")
          toast({
            title: "Deck not found",
            description: "The requested deck could not be found.",
            variant: "destructive",
          })
          return
        }

        console.log("Loaded deck:", deckData)
        setDeck(deckData)
      } catch (error) {
        console.error("Error loading deck:", error)
        setError("There was a problem loading the deck.")
        toast({
          title: "Error",
          description: "There was a problem loading the deck.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDeck()

    // Re-run when db is initialized
    if (!db) {
      const checkInterval = setInterval(() => {
        if (db) {
          loadDeck()
          clearInterval(checkInterval)
        }
      }, 500)

      return () => clearInterval(checkInterval)
    }
  }, [deckId, getDeck, router, toast, db])

  const handleExport = async () => {
    try {
      const exportData = await exportDeck(deckId)

      // Create a downloadable file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `${deck.name.replace(/\s+/g, "-").toLowerCase()}-export.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Deck exported",
        description: "Your deck has been exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting deck:", error)
      toast({
        title: "Export failed",
        description: "There was a problem exporting your deck.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-serif font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/decks")}>Go Back to Decks</Button>
        </div>
      </div>
    )
  }

  if (!deck) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-serif font-bold">{deck.name}</h1>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">{deck.description}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {deck.wordCount} {deck.wordCount === 1 ? "word" : "words"}
            </span>
            <span>•</span>
            <span>Last updated: {new Date(deck.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/decks/${deckId}/study`}>
            <Button>Study Deck</Button>
          </Link>
          <Link href={`/decks/${deckId}/add`}>
            <Button variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Word
            </Button>
          </Link>
          <Button variant="outline" className="gap-1" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href={`/decks/${deckId}/import`}>
            <Button variant="outline" className="gap-1">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </Link>
        </div>

        <FlashcardList deckId={deckId} />
      </div>
    </div>
  )
}
