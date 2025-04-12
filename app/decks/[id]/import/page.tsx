"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useDatabase } from "@/components/database-provider"

export default function ImportWordsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addCard, getDeck } = useDatabase()

  const [importData, setImportData] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const deckId = params.id as string

  const handleImport = async () => {
    if (!importData.trim()) {
      setErrors(["Please enter data to import"])
      return
    }

    setIsSubmitting(true)
    setErrors([])

    try {
      // Get the deck to verify it exists
      const deck = await getDeck(deckId)
      if (!deck) {
        toast({
          title: "Deck not found",
          description: "The deck you're trying to import to doesn't exist.",
          variant: "destructive",
        })
        router.push("/decks")
        return
      }

      // Parse the JSON data
      let wordsToImport
      try {
        wordsToImport = JSON.parse(importData)
      } catch (error) {
        setErrors(["Invalid JSON format. Please check your data."])
        setIsSubmitting(false)
        return
      }

      // Validate the data structure
      if (!Array.isArray(wordsToImport) && !wordsToImport.cards) {
        setErrors(["Import data must be an array of words or an object with a 'cards' array."])
        setIsSubmitting(false)
        return
      }

      // Get the cards array
      const cards = Array.isArray(wordsToImport) ? wordsToImport : wordsToImport.cards

      if (!Array.isArray(cards)) {
        setErrors(["No valid cards found in import data."])
        setIsSubmitting(false)
        return
      }

      // Import each card
      let importedCount = 0
      const importErrors: string[] = []

      for (const card of cards) {
        try {
          if (!card.word || !card.definition) {
            importErrors.push(`Card missing required fields: ${JSON.stringify(card)}`)
            continue
          }

          await addCard(deckId, {
            word: card.word,
            definition: card.definition,
            literaryDefinition: card.literaryDefinition || "",
            partOfSpeech: card.partOfSpeech || "noun",
            example: card.example || "",
            synonyms: card.synonyms || [],
            tags: card.tags || [],
            difficulty: card.difficulty || "intermediate",
          })

          importedCount++
        } catch (error) {
          importErrors.push(`Error importing card: ${card.word}`)
        }
      }

      if (importedCount > 0) {
        toast({
          title: "Import successful",
          description: `Successfully imported ${importedCount} words to your deck.`,
        })
        router.push(`/decks/${deckId}`)
      } else {
        setErrors(["No words were imported. Please check your data format."])
      }

      if (importErrors.length > 0) {
        setErrors(importErrors)
      }
    } catch (error) {
      console.error("Import error:", error)
      setErrors(["An unexpected error occurred during import."])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-serif font-bold">Import Words</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import Words to Deck</CardTitle>
            <CardDescription>
              Paste JSON data containing words to import into this deck. The data should be an array of word objects or
              an exported deck format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`Paste your JSON data here...
Example:
[
  {
    "word": "Example",
    "definition": "A thing characteristic of its kind",
    "partOfSpeech": "noun",
    "example": "This is an example sentence.",
    "synonyms": ["instance", "sample"],
    "tags": ["common", "useful"]
  }
]`}
              className="min-h-[300px] font-mono text-sm"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />

            {errors.length > 0 && (
              <div className="bg-destructive/10 p-4 rounded-md">
                <h4 className="font-medium text-destructive mb-2">Import Errors:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isSubmitting}>
              {isSubmitting ? (
                "Importing..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Words
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
