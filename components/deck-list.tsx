"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Edit, MoreHorizontal, Plus, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDatabase } from "@/components/database-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export function DeckList() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const { getUserDecks, deleteDeck, db } = useDatabase()
  const { toast } = useToast()

  useEffect(() => {
    const loadDecks = async () => {
      try {
        // Wait for database to be initialized
        if (!db) {
          console.log("Database not yet initialized, waiting...")
          return
        }

        console.log("Loading decks from database...")
        const userDecks = await getUserDecks()
        console.log("Loaded decks:", userDecks)
        setDecks(userDecks)
      } catch (error) {
        console.error("Error loading decks:", error)
        toast({
          title: "Error loading decks",
          description: "There was a problem loading your decks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDecks()

    // Re-run when db is initialized
    if (!db) {
      const checkInterval = setInterval(() => {
        if (db) {
          loadDecks()
          clearInterval(checkInterval)
        }
      }, 500)

      return () => clearInterval(checkInterval)
    }
  }, [getUserDecks, toast, db])

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDeck(deckId)
      setDecks(decks.filter((deck) => deck.id !== deckId))
      toast({
        title: "Deck deleted",
        description: "The deck has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error deleting deck",
        description: "There was a problem deleting this deck.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle className="h-6 bg-muted rounded"></CardTitle>
              <CardDescription className="h-4 bg-muted rounded w-1/2 mt-2"></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (decks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No Decks Yet</CardTitle>
          <CardDescription>Create your first vocabulary deck to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/decks/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Create New Deck
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <Card key={deck.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif">{deck.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/decks/${deck.id}/edit`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Deck
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteDeck(deck.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Deck
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>{deck.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {deck.wordCount} {deck.wordCount === 1 ? "word" : "words"}
            </p>
          </CardContent>
          <CardFooter>
            <div className="flex gap-2">
              <Link href={`/decks/${deck.id}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <BookOpen className="h-4 w-4" />
                  View
                </Button>
              </Link>
              <Link href={`/decks/${deck.id}/study`}>
                <Button size="sm">Study</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

interface Deck {
  id: string
  name: string
  description: string
  wordCount: number
  createdAt: Date
  updatedAt: Date
}
