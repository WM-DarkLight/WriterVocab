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

export default function EditDeckPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getDeck, updateDeck } = useDatabase()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const deckId = params.id as string

  useEffect(() => {
    const loadDeck = async () => {
      try {
        const deck = await getDeck(deckId)
        if (!deck) {
          toast({
            title: "Deck not found",
            description: "The deck you're trying to edit doesn't exist.",
            variant: "destructive",
          })
          router.push("/decks")
          return
        }

        setName(deck.name || "")
        setDescription(deck.description || "")
      } catch (error) {
        console.error("Error loading deck:", error)
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
  }, [deckId, getDeck, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your deck.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await updateDeck(deckId, {
        name,
        description,
      })

      toast({
        title: "Deck updated",
        description: "Your deck has been updated successfully.",
      })

      router.push(`/decks/${deckId}`)
    } catch (error) {
      console.error("Error updating deck:", error)
      toast({
        title: "Error",
        description: "There was a problem updating your deck.",
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
          <h1 className="text-2xl font-serif font-bold">Edit Deck</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Deck Details</CardTitle>
              <CardDescription>Edit your vocabulary deck details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Deck Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter deck name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for your deck"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
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
