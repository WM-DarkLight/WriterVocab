"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useDatabase } from "@/components/database-provider"

export default function EditCardPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { db } = useDatabase()

  const [word, setWord] = useState("")
  const [definition, setDefinition] = useState("")
  const [literaryDefinition, setLiteraryDefinition] = useState("")
  const [partOfSpeech, setPartOfSpeech] = useState("")
  const [example, setExample] = useState("")
  const [synonyms, setSynonyms] = useState("")
  const [tags, setTags] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const deckId = params.id as string
  const cardId = params.cardId as string

  useEffect(() => {
    const loadCard = async () => {
      if (!db) return

      try {
        const card = await db.get("cards", cardId)
        if (!card) {
          toast({
            title: "Card not found",
            description: "The card you're trying to edit doesn't exist.",
            variant: "destructive",
          })
          router.push(`/decks/${deckId}`)
          return
        }

        // Verify the card belongs to the current deck
        if (card.deckId !== deckId) {
          toast({
            title: "Card not in this deck",
            description: "The card you're trying to edit doesn't belong to this deck.",
            variant: "destructive",
          })
          router.push(`/decks/${deckId}`)
          return
        }

        setWord(card.word || "")
        setDefinition(card.definition || "")
        setLiteraryDefinition(card.literaryDefinition || "")
        setPartOfSpeech(card.partOfSpeech || "")
        setExample(card.example || "")
        setSynonyms(card.synonyms ? card.synonyms.join(", ") : "")
        setTags(card.tags ? card.tags.join(", ") : "")
        setDifficulty(card.difficulty || "intermediate")
      } catch (error) {
        console.error("Error loading card:", error)
        toast({
          title: "Error",
          description: "There was a problem loading the card.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCard()
  }, [db, cardId, deckId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!word.trim() || !definition.trim() || !partOfSpeech.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!db) throw new Error("Database not initialized")

      const synonymsArray = synonyms
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const card = await db.get("cards", cardId)
      if (!card) throw new Error("Card not found")

      await db.put("cards", {
        ...card,
        word,
        definition,
        literaryDefinition,
        partOfSpeech,
        example,
        synonyms: synonymsArray,
        tags: tagsArray,
        difficulty,
        updatedAt: new Date(),
      })

      toast({
        title: "Card updated",
        description: `"${word}" has been updated successfully.`,
      })

      router.push(`/decks/${deckId}`)
    } catch (error) {
      console.error("Error updating card:", error)
      toast({
        title: "Error",
        description: "There was a problem updating the card.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-serif font-bold">Edit Word</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Word Details</CardTitle>
              <CardDescription>Edit the details of this vocabulary word.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="word">
                    Word <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="word"
                    placeholder="Enter word"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partOfSpeech">
                    Part of Speech <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="partOfSpeech"
                    placeholder="e.g., noun, verb, adjective"
                    value={partOfSpeech}
                    onChange={(e) => setPartOfSpeech(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="definition">
                  Definition <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="definition"
                  placeholder="Enter the definition"
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="literaryDefinition">Literary Definition</Label>
                <Textarea
                  id="literaryDefinition"
                  placeholder="Enter a literary-focused definition (optional)"
                  value={literaryDefinition}
                  onChange={(e) => setLiteraryDefinition(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="example">Example Sentence</Label>
                <Textarea
                  id="example"
                  placeholder="Enter an example sentence using this word"
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="synonyms">Synonyms</Label>
                  <Input
                    id="synonyms"
                    placeholder="Comma-separated list of synonyms"
                    value={synonyms}
                    onChange={(e) => setSynonyms(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., poetic, archaic, formal"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <select
                  id="difficulty"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
