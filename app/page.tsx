import Link from "next/link"
import { BookOpen, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WordOfTheDay } from "@/components/word-of-the-day"
import { DeckList } from "@/components/deck-list"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-serif font-bold">WriterVocab</h1>
          <p className="text-muted-foreground">
            Expand your vocabulary for creative writing, storytelling, and prose enhancement.
          </p>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search for words..." className="pl-8" />
          </div>
        </div>

        <WordOfTheDay />

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold">Your Decks</h2>
          <Link href="/decks/new">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Deck
            </Button>
          </Link>
        </div>

        <DeckList />

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold">Built-in Collections</h2>
          <Link href="/collections">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["Emotions", "Descriptions", "Classical", "Gothic", "Action"].map((category) => (
            <Link key={category} href={`/collections/${category.toLowerCase()}`} className="group">
              <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-medium text-lg">{category}</h3>
                  <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{getCollectionDescription(category)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function getCollectionDescription(category: string): string {
  const descriptions: Record<string, string> = {
    Emotions: "Words that evoke and describe complex emotional states.",
    Descriptions: "Vivid adjectives and phrases for detailed scene-setting.",
    Classical: "Timeless vocabulary from literary classics and scholarly works.",
    Gothic: "Dark, atmospheric words perfect for mystery and horror.",
    Action: "Dynamic verbs and expressions to energize action sequences.",
  }

  return descriptions[category] || "A collection of useful vocabulary for writers."
}
