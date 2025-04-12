"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface FlashcardPreviewProps {
  card: any
  showDetails?: boolean
}

export function FlashcardPreview({ card, showDetails = false }: FlashcardPreviewProps) {
  const [flipped, setFlipped] = useState(false)
  const { toast } = useToast()

  const handlePlayPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation()
    // In a real app, this would play audio
    toast({
      title: "Audio feature",
      description: "Audio pronunciation would play here in the full version.",
    })
  }

  return (
    <div className="perspective-1000 w-full h-full">
      <div
        className={`relative w-full h-full cursor-pointer transition-all duration-500 ${flipped ? "rotate-y-180" : ""}`}
        onClick={() => setFlipped(!flipped)}
        style={{ transformStyle: "preserve-3d", minHeight: showDetails ? "300px" : "200px" }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 w-full h-full ${flipped ? "invisible" : "visible"}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-xl">{card.word}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {card.partOfSpeech}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePlayPronunciation}>
                      <Volume2 className="h-4 w-4" />
                      <span className="sr-only">Pronunciation</span>
                    </Button>
                  </CardDescription>
                </div>
                <Badge variant={getDifficultyVariant(card.difficulty)}>{card.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mt-4">Click to reveal definition</p>
              {showDetails && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {card.lastReviewed ? (
                    <p>Last reviewed: {new Date(card.lastReviewed).toLocaleDateString()}</p>
                  ) : (
                    <p>Not reviewed yet</p>
                  )}
                  <p>Review count: {card.reviewCount || 0}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back of card */}
        <div
          className={`absolute inset-0 w-full h-full ${flipped ? "visible" : "invisible"}`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Definition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>{card.definition}</p>

              {card.literaryDefinition && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Literary Context</h3>
                  <p className="italic">{card.literaryDefinition}</p>
                </div>
              )}

              {card.example && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Example</h3>
                  <p className="text-muted-foreground italic">{card.example}</p>
                </div>
              )}

              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getDifficultyVariant(difficulty: string) {
  switch (difficulty) {
    case "beginner":
      return "outline"
    case "intermediate":
      return "secondary"
    case "advanced":
      return "default"
    default:
      return "outline"
  }
}
