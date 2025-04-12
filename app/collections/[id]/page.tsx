"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useDatabase } from "@/components/database-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCollection } from "@/lib/word-database/words"

export default function CollectionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getUserDecks, addToUserDeck } = useDatabase()
  const [collection, setCollection] = useState<any>(null)
  const [userDecks, setUserDecks] = useState<any[]>([])
  const [selectedWord, setSelectedWord] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCollection = () => {
      const id = params.id as string
      const foundCollection = getCollection(id)

      if (foundCollection) {
        setCollection(foundCollection)
      } else {
        router.push("/collections")
        toast({
          title: "Collection not found",
          description: "The requested collection could not be found.",
          variant: "destructive",
        })
      }

      setLoading(false)
    }

    const loadDecks = async () => {
      const decks = await getUserDecks()
      setUserDecks(decks)
    }

    loadCollection()
    loadDecks()
  }, [params.id, router, toast, getUserDecks])

  const handleAddToDeck = async (deckId: string, word: any) => {
    try {
      await addToUserDeck(deckId, {
        word: word.word,
        definition: word.definition,
        literaryDefinition: word.literaryDefinition,
        partOfSpeech: word.partOfSpeech,
        example: word.example,
        synonyms: word.synonyms,
        tags: word.tags,
        difficulty: word.difficulty,
      })

      toast({
        title: "Word Added",
        description: `"${word.word}" has been added to your deck.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add word to deck.",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/collections")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold">{collection.name}</h1>
            <p className="text-muted-foreground">{collection.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collection.words.map((word: any) => (
            <Card key={word.id} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif">{word.word}</CardTitle>
                  <Badge variant="outline">{word.partOfSpeech}</Badge>
                </div>
                <CardDescription>{word.definition}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm italic">"{word.example}"</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {word.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedWord(word)}>
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl">{selectedWord?.word}</DialogTitle>
                      <DialogDescription>
                        {selectedWord?.partOfSpeech} • {selectedWord?.difficulty} level
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Definition</h4>
                        <p>{selectedWord?.definition}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Literary Definition</h4>
                        <p>{selectedWord?.literaryDefinition}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Example</h4>
                        <p className="italic">"{selectedWord?.example}"</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Synonyms</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedWord?.synonyms.map((synonym: string) => (
                            <Badge key={synonym} variant="outline" className="text-xs">
                              {synonym}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedWord?.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add to Deck
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {userDecks.length > 0 ? (
                      userDecks.map((deck) => (
                        <DropdownMenuItem key={deck.id} onClick={() => handleAddToDeck(deck.id, word)}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          {deck.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No decks available</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
