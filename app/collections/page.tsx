"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAllCollections } from "@/lib/word-database/words"

export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading to ensure consistent UX
    const loadCollections = () => {
      const allCollections = getAllCollections()
      setCollections(allCollections)
      setLoading(false)
    }

    loadCollections()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold">Word Collections</h1>
            <p className="text-muted-foreground mt-2">
              Explore our curated collections of words organized by theme and purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse h-[200px]">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Word Collections</h1>
          <p className="text-muted-foreground mt-2">
            Explore our curated collections of words organized by theme and purpose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="h-full">
              <CardHeader>
                <CardTitle className="font-serif">{collection.name}</CardTitle>
                <CardDescription>{collection.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{collection.words.length} words</Badge>
                  {collection.words.slice(0, 3).map((word) => (
                    <Badge key={word.id} variant="outline">
                      {word.word}
                    </Badge>
                  ))}
                  {collection.words.length > 3 && <Badge variant="outline">+{collection.words.length - 3} more</Badge>}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push(`/collections/${collection.id}`)}>
                  <BookOpen className="h-4 w-4 mr-2" /> Browse Collection
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
