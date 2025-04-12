"use client"

import { useEffect, useState } from "react"
import { BookmarkIcon, Volume2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useDatabase } from "@/components/database-provider"

export function WordOfTheDay() {
  const [word, setWord] = useState<Word | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { addToUserDeck, getUserDecks, createDeck } = useDatabase()

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      try {
        // In a real app, we'd fetch from IndexedDB or rotate through a predefined list
        // For demo purposes, we'll use a hardcoded word
        const todaysWord: Word = {
          id: "wotd-1",
          word: "Ephemeral",
          definition: "Lasting for a very short time; transitory.",
          literaryDefinition:
            "Like morning dew that vanishes with the rising sun, capturing the fleeting nature of beauty and existence.",
          partOfSpeech: "adjective",
          example: "The ephemeral beauty of cherry blossoms made the moment all the more precious to the young writer.",
          synonyms: ["fleeting", "transient", "momentary", "brief", "short-lived"],
          tags: ["poetic", "melancholic", "literary"],
          pronunciation: "/əˈfem(ə)rəl/",
          difficulty: "intermediate",
        }

        setWord(todaysWord)
      } catch (error) {
        console.error("Error fetching word of the day:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWordOfTheDay()
  }, [])

  // Update the handleSaveWord function to find or create a favorites deck

  const handleSaveWord = async () => {
    if (!word) return

    try {
      // Get all user decks
      const userDecks = await getUserDecks()

      // Find the favorites deck or create it if it doesn't exist
      const favoritesDeck = userDecks.find((deck) => deck.name.toLowerCase() === "favorites")
      let favoritesDeckId

      if (!favoritesDeck) {
        // Create a favorites deck if it doesn't exist
        favoritesDeckId = await createDeck({
          name: "Favorites",
          description: "Your saved favorite words",
        })
      } else {
        favoritesDeckId = favoritesDeck.id
      }

      // Now add the word to the favorites deck
      await addToUserDeck(favoritesDeckId, word)

      toast({
        title: "Word saved",
        description: `"${word.word}" has been added to your favorites.`,
      })
    } catch (error) {
      console.error("Error saving word:", error)
      toast({
        title: "Error saving word",
        description: "There was a problem saving this word.",
        variant: "destructive",
      })
    }
  }

  const handlePlayPronunciation = () => {
    // In a real app, this would play audio
    toast({
      title: "Audio feature",
      description: "Audio pronunciation would play here in the full version.",
    })
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-8 bg-muted rounded"></CardTitle>
          <CardDescription className="h-4 bg-muted rounded w-1/3"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </CardContent>
      </Card>
    )
  }

  if (!word) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Word of the Day</CardTitle>
          <CardDescription>No word available today.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-2xl">{word.word}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {word.partOfSpeech}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePlayPronunciation}>
                <Volume2 className="h-4 w-4" />
                <span className="sr-only">Pronunciation</span>
              </Button>
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleSaveWord}>
            <BookmarkIcon className="h-4 w-4" />
            <span className="sr-only">Save to favorites</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Definition</h3>
          <p>{word.definition}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Literary Context</h3>
          <p className="italic">{word.literaryDefinition}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Example</h3>
          <p className="text-muted-foreground">{word.example}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {word.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Synonyms:</span>
          {word.synonyms.join(", ")}
        </div>
      </CardFooter>
    </Card>
  )
}

interface Word {
  id: string
  word: string
  definition: string
  literaryDefinition: string
  partOfSpeech: string
  example: string
  synonyms: string[]
  tags: string[]
  pronunciation: string
  difficulty: string
}
