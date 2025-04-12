"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Edit, MoreHorizontal, Trash, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useDatabase } from "@/components/database-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FlashcardListProps {
  deckId: string
}

export function FlashcardList({ deckId }: FlashcardListProps) {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { getCardsInDeck, deleteCard } = useDatabase()
  const { toast } = useToast()

  useEffect(() => {
    const loadCards = async () => {
      try {
        const deckCards = await getCardsInDeck(deckId)
        setCards(deckCards)
      } catch (error) {
        console.error("Error loading cards:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [deckId, getCardsInDeck])

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId)
      setCards(cards.filter((card) => card.id !== cardId))
      toast({
        title: "Card deleted",
        description: "The flashcard has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error deleting card",
        description: "There was a problem deleting this flashcard.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle className="h-6 bg-muted rounded"></CardTitle>
              <CardDescription className="h-4 bg-muted rounded w-1/4 mt-2"></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No Words Yet</CardTitle>
          <CardDescription>Add your first word to this deck to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={`/decks/${deckId}/add`}>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Word
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-xl">{card.word}</CardTitle>
                <CardDescription>{card.partOfSpeech}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/decks/${deckId}/edit/${card.id}`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Card
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Card
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Definition</h3>
              <p>{card.definition}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Example</h3>
              <p className="text-muted-foreground italic">{card.example}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.tags &&
                card.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
