"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useDatabase } from "@/components/database-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getDeck, getCardsInDeck, updateCard, db } = useDatabase()

  const [deck, setDeck] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState("flip-card")
  const [quizOptions, setQuizOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [writingPrompt, setWritingPrompt] = useState("")
  const [showWritingAnswer, setShowWritingAnswer] = useState(false)

  const deckId = params.id as string

  useEffect(() => {
    const loadDeckAndCards = async () => {
      try {
        // Wait for database to be initialized
        if (!db) {
          console.log("Database not yet initialized, waiting...")
          return
        }

        console.log("Loading deck with ID:", deckId)
        const deckData = await getDeck(deckId)

        if (!deckData) {
          console.error("Deck not found:", deckId)
          setError("The requested deck could not be found.")
          toast({
            title: "Deck not found",
            description: "The requested deck could not be found.",
            variant: "destructive",
          })
          return
        }

        setDeck(deckData)
        console.log("Loaded deck:", deckData)

        console.log("Loading cards for deck:", deckId)
        const deckCards = await getCardsInDeck(deckId)
        console.log("Loaded cards:", deckCards)

        if (deckCards.length === 0) {
          setError("This deck has no cards to study.")
          toast({
            title: "Empty deck",
            description: "This deck has no cards to study.",
          })
          return
        }

        // Shuffle the cards
        const shuffled = [...deckCards].sort(() => Math.random() - 0.5)
        setCards(shuffled)

        // Set up quiz options for the first card
        if (shuffled.length > 0) {
          setupQuizOptions(shuffled, 0)
        }
      } catch (error) {
        console.error("Error loading deck and cards:", error)
        setError("There was a problem loading the study session.")
        toast({
          title: "Error",
          description: "There was a problem loading the study session.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDeckAndCards()

    // Re-run when db is initialized
    if (!db) {
      const checkInterval = setInterval(() => {
        if (db) {
          loadDeckAndCards()
          clearInterval(checkInterval)
        }
      }, 500)

      return () => clearInterval(checkInterval)
    }
  }, [deckId, getDeck, getCardsInDeck, router, toast, db])

  // Generate fake options if there aren't enough cards
  const generateFakeOptions = (correctWord: string): string[] => {
    // List of common prefixes and suffixes to create plausible fake words
    const prefixes = [
      "un",
      "re",
      "in",
      "dis",
      "en",
      "em",
      "pre",
      "pro",
      "sub",
      "super",
      "inter",
      "trans",
      "non",
      "over",
      "under",
    ]
    const suffixes = [
      "able",
      "ible",
      "al",
      "ial",
      "ed",
      "en",
      "er",
      "est",
      "ful",
      "ic",
      "ing",
      "ion",
      "ive",
      "less",
      "ly",
      "ment",
      "ness",
      "ous",
      "ity",
      "ize",
      "ise",
    ]

    // Generate fake words by:
    // 1. Changing a character
    // 2. Adding a prefix
    // 3. Adding a suffix
    const fakeWords: string[] = []

    // Change a character
    if (correctWord.length > 3) {
      const pos = Math.floor(Math.random() * (correctWord.length - 2)) + 1
      const chars = "abcdefghijklmnopqrstuvwxyz"
      const randomChar = chars.charAt(Math.floor(Math.random() * chars.length))
      fakeWords.push(correctWord.substring(0, pos) + randomChar + correctWord.substring(pos + 1))
    }

    // Add a prefix
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    fakeWords.push(randomPrefix + correctWord)

    // Add a suffix
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    // Remove last character if it would make the word look more natural
    const baseWord = /[aeiou]$/.test(correctWord) ? correctWord.slice(0, -1) : correctWord
    fakeWords.push(baseWord + randomSuffix)

    // Return unique fake words
    return [...new Set(fakeWords)]
  }

  const setupQuizOptions = (cardArray: any[], index: number) => {
    const currentCard = cardArray[index]
    if (!currentCard) return

    // Get other cards different from the current one
    const otherCards = cardArray.filter((_, i) => i !== index)

    // Initialize options with the correct answer
    let options = [currentCard.word]

    // Add words from other cards if available
    if (otherCards.length > 0) {
      const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5)
      const otherWords = shuffledOthers.slice(0, Math.min(3, otherCards.length)).map((c) => c.word)
      options = [...options, ...otherWords]
    }

    // If we still don't have 4 options, generate fake ones
    if (options.length < 4) {
      const fakeOptions = generateFakeOptions(currentCard.word)
      options = [...options, ...fakeOptions]
    }

    // Ensure we have exactly 4 unique options
    options = [...new Set(options)].slice(0, 4)

    // If we still don't have 4 options (unlikely), add more fake ones
    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`)
    }

    // Shuffle the options
    setQuizOptions(options.sort(() => Math.random() - 0.5))
    setSelectedAnswer(null)
    setIsCorrect(null)
  }

  const handleNext = async () => {
    if (currentIndex < cards.length - 1) {
      setFlipped(false)
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowWritingAnswer(false)
      setWritingPrompt("")
      setupQuizOptions(cards, currentIndex + 1)

      // Update card review data
      const card = cards[currentIndex]
      try {
        await updateCard(card.id, {
          lastReviewed: new Date(),
          reviewCount: (card.reviewCount || 0) + 1,
        })
      } catch (error) {
        console.error("Error updating card review:", error)
      }
    } else {
      // End of deck
      toast({
        title: "Study session complete",
        description: "You've reviewed all cards in this deck.",
      })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setFlipped(false)
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowWritingAnswer(false)
      setWritingPrompt("")
      setupQuizOptions(cards, currentIndex - 1)
    }
  }

  const handleReset = () => {
    // Shuffle the cards again
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setFlipped(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowWritingAnswer(false)
    setWritingPrompt("")
    setupQuizOptions(shuffled, 0)

    toast({
      title: "Study session reset",
      description: "Cards have been shuffled.",
    })
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    const currentCard = cards[currentIndex]
    const correct = answer === currentCard.word
    setIsCorrect(correct)
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-serif font-bold mb-4">Cannot Study</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push(`/decks/${deckId}`)}>Go Back to Deck</Button>
        </div>
      </div>
    )
  }

  if (!deck || cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-serif font-bold mb-4">No Cards to Study</h2>
          <p className="text-muted-foreground mb-6">This deck doesn't have any cards yet.</p>
          <Button onClick={() => router.push(`/decks/${deckId}/add`)}>Add Cards to Deck</Button>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-2xl font-serif font-bold">Studying: {deck.name}</h1>
          </div>

          <Select value={studyMode} onValueChange={setStudyMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Study Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flip-card">Flip Card</SelectItem>
              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              <SelectItem value="writing-prompt">Writing Prompt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-3 w-3" />
            Shuffle
          </Button>
        </div>

        {studyMode === "flip-card" && (
          <div className="perspective-1000 w-full">
            <div
              className={`relative w-full min-h-[300px] cursor-pointer transition-all duration-500 ${
                flipped ? "rotate-y-180" : ""
              }`}
              onClick={() => setFlipped(!flipped)}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card */}
              <div
                className={`absolute inset-0 w-full h-full ${flipped ? "invisible" : "visible"}`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-serif">{currentCard.word}</h2>
                      <p className="text-sm text-muted-foreground">{currentCard.partOfSpeech}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayPronunciation()
                      }}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="sr-only">Pronunciation</span>
                    </Button>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-[200px]">
                    <p className="text-center text-muted-foreground">Click to reveal definition</p>
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
                  <CardHeader>
                    <h3 className="text-lg font-medium">Definition</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{currentCard.definition}</p>

                    {currentCard.literaryDefinition && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Literary Context</h4>
                        <p className="italic">{currentCard.literaryDefinition}</p>
                      </div>
                    )}

                    {currentCard.example && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Example</h4>
                        <p className="text-muted-foreground">{currentCard.example}</p>
                      </div>
                    )}

                    {currentCard.tags && currentCard.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentCard.tags.map((tag: string) => (
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
        )}

        {studyMode === "multiple-choice" && (
          <Card className="min-h-[300px]">
            <CardHeader>
              <h2 className="text-xl font-medium">Which word matches this definition?</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-md">
                <p>{currentCard.definition}</p>
                {currentCard.example && (
                  <p className="mt-2 text-muted-foreground italic">
                    Example: {currentCard.example.replace(new RegExp(currentCard.word, "gi"), "________")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quizOptions.map((option) => (
                  <Button
                    key={option}
                    variant={
                      selectedAnswer === option ? (option === currentCard.word ? "default" : "destructive") : "outline"
                    }
                    className={
                      selectedAnswer !== null && option === currentCard.word
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : ""
                    }
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {isCorrect !== null && (
                <div
                  className={`p-3 rounded-md ${isCorrect ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}
                >
                  {isCorrect ? (
                    <p>Correct! Well done.</p>
                  ) : (
                    <p>Incorrect. The correct answer is "{currentCard.word}".</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {studyMode === "writing-prompt" && (
          <Card className="min-h-[300px]">
            <CardHeader>
              <h2 className="text-xl font-medium">Use this word in a sentence</h2>
              <p className="text-muted-foreground">
                Write a sentence using the word "{currentCard.word}" ({currentCard.partOfSpeech})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your sentence here..."
                value={writingPrompt}
                onChange={(e) => setWritingPrompt(e.target.value)}
                rows={4}
              />

              <div className="flex justify-end">
                <Button
                  onClick={() => setShowWritingAnswer(true)}
                  disabled={writingPrompt.trim().length === 0 || showWritingAnswer}
                >
                  Check Example
                </Button>
              </div>

              {showWritingAnswer && (
                <div className="p-4 bg-muted/50 rounded-md">
                  <h3 className="font-medium mb-2">Example sentence:</h3>
                  <p className="italic">{currentCard.example}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button onClick={handleNext} disabled={currentIndex === cards.length - 1} className="gap-1">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
