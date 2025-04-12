"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useDatabase } from "@/components/database-provider"

export default function NewDeckPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { createDeck } = useDatabase()

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
      const deckId = await createDeck({
        name,
        description,
      })

      toast({
        title: "Deck created",
        description: "Your new deck has been created successfully.",
      })

      router.push(`/decks/${deckId}`)
    } catch (error) {
      console.error("Error creating deck:", error)
      toast({
        title: "Error",
        description: "There was a problem creating your deck.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="font-serif">Create New Deck</CardTitle>
              <CardDescription>Create a new vocabulary deck to organize your words.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Deck Name</Label>
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
                {isSubmitting ? "Creating..." : "Create Deck"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
