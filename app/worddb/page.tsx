"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, Plus, Check, Upload, Copy } from "lucide-react"
import { useDatabase } from "@/components/database-provider"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { getAllWords, CATEGORIES, DIFFICULTIES, PARTS_OF_SPEECH } from "@/lib/word-database/words"
import { parseJsonWords, parseCsvWords } from "@/lib/word-database/import-utils"
import {
  generateWordTemplate,
  generateMultipleTemplates,
  generateCsvTemplate,
  generateJsonTemplate,
} from "@/lib/word-database/template-generator"

export default function WordDBPage() {
  const { getUserDecks, addToUserDeck } = useDatabase()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [userDecks, setUserDecks] = useState<any[]>([])
  const [selectedWord, setSelectedWord] = useState<any>(null)
  const [addingToDecks, setAddingToDecks] = useState<Record<string, boolean>>({})
  const [showAdmin, setShowAdmin] = useState(false)
  const [templateCount, setTemplateCount] = useState(5)
  const [templateCategory, setTemplateCategory] = useState(CATEGORIES[0])
  const [templateDifficulty, setTemplateDifficulty] = useState(DIFFICULTIES[0])
  const [templatePartOfSpeech, setTemplatePartOfSpeech] = useState(PARTS_OF_SPEECH[0])
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json")
  const [importData, setImportData] = useState("")
  const [importErrors, setImportErrors] = useState<string[]>([])

  useEffect(() => {
    const loadDecks = async () => {
      const decks = await getUserDecks()
      setUserDecks(decks)
    }

    loadDecks()
  }, [getUserDecks])

  const words = getAllWords()

  const filteredWords = words.filter((word) => {
    const matchesSearch =
      searchTerm === "" ||
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = category === "all" || word.category === category
    const matchesDifficulty = difficulty === "all" || word.difficulty === difficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleAddToDeck = async (deckId: string, word: any) => {
    try {
      setAddingToDecks((prev) => ({ ...prev, [deckId]: true }))

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
    } finally {
      setAddingToDecks((prev) => ({ ...prev, [deckId]: false }))
    }
  }

  const handleGenerateTemplate = () => {
    const template = generateWordTemplate(
      templateCategory as any,
      templateDifficulty as any,
      templatePartOfSpeech as any,
    )
    navigator.clipboard.writeText(template)
    toast({
      title: "Template Copied",
      description: "Word template has been copied to clipboard.",
    })
  }

  const handleGenerateMultipleTemplates = () => {
    const templates = generateMultipleTemplates(templateCount, templateCategory as any)
    navigator.clipboard.writeText(templates)
    toast({
      title: "Templates Copied",
      description: `${templateCount} word templates have been copied to clipboard.`,
    })
  }

  const handleGenerateCsvTemplate = () => {
    const template = generateCsvTemplate()
    navigator.clipboard.writeText(template)
    toast({
      title: "CSV Template Copied",
      description: "CSV template header has been copied to clipboard.",
    })
  }

  const handleGenerateJsonTemplate = () => {
    const template = generateJsonTemplate(templateCount)
    navigator.clipboard.writeText(template)
    toast({
      title: "JSON Template Copied",
      description: `JSON template with ${templateCount} words has been copied to clipboard.`,
    })
  }

  const handleImportWords = () => {
    if (!importData.trim()) {
      setImportErrors(["Please enter data to import"])
      return
    }

    try {
      const result = importFormat === "json" ? parseJsonWords(importData) : parseCsvWords(importData)

      if (result.errors.length > 0) {
        setImportErrors(result.errors)
        toast({
          title: "Import Errors",
          description: `Found ${result.errors.length} errors in the import data.`,
          variant: "destructive",
        })
      } else if (result.words.length === 0) {
        setImportErrors(["No valid words found in the import data"])
        toast({
          title: "Import Failed",
          description: "No valid words found in the import data.",
          variant: "destructive",
        })
      } else {
        setImportErrors([])
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.words.length} words.`,
        })

        // Here you would typically save these words to your database
        // For now, we'll just show a success message
        console.log("Imported words:", result.words)
      }
    } catch (error) {
      setImportErrors([`Failed to import: ${(error as Error).message}`])
      toast({
        title: "Import Failed",
        description: `Failed to import: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold">Word Database</h1>
            <p className="text-muted-foreground mt-2">
              Explore our curated collection of words and add them to your decks.
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowAdmin(!showAdmin)}>
            {showAdmin ? "Hide Admin Tools" : "Show Admin Tools"}
          </Button>
        </div>

        {showAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
              <CardDescription>Tools to help you add more words to the database</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="templates">
                <TabsList className="mb-4">
                  <TabsTrigger value="templates">Generate Templates</TabsTrigger>
                  <TabsTrigger value="import">Import Words</TabsTrigger>
                  <TabsTrigger value="export">Export Format</TabsTrigger>
                </TabsList>

                <TabsContent value="templates">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Category</label>
                        <Select value={templateCategory} onValueChange={setTemplateCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Difficulty</label>
                        <Select value={templateDifficulty} onValueChange={setTemplateDifficulty}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTIES.map((diff) => (
                              <SelectItem key={diff} value={diff}>
                                {diff.charAt(0).toUpperCase() + diff.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Part of Speech</label>
                        <Select value={templatePartOfSpeech} onValueChange={setTemplatePartOfSpeech}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PARTS_OF_SPEECH.map((pos) => (
                              <SelectItem key={pos} value={pos}>
                                {pos.charAt(0).toUpperCase() + pos.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={handleGenerateTemplate}>
                        <Copy className="h-4 w-4 mr-2" /> Copy Single Template
                      </Button>
                      <span className="text-sm text-muted-foreground">or</span>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={templateCount}
                        onChange={(e) => setTemplateCount(Number.parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Button onClick={handleGenerateMultipleTemplates}>
                        <Copy className="h-4 w-4 mr-2" /> Copy Multiple Templates
                      </Button>
                    </div>

                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-2">How to add words to the database:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Generate a template using the buttons above</li>
                        <li>
                          Open <code className="bg-background px-1 rounded">lib/word-database/words.ts</code>
                        </li>
                        <li>
                          Add your new word(s) to the appropriate category array (e.g., <code>emotionWords</code>,{" "}
                          <code>descriptionWords</code>, etc.)
                        </li>
                        <li>Fill in all the fields with your word information</li>
                        <li>Save the file and refresh the page to see your new words</li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="import">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="json-format"
                          checked={importFormat === "json"}
                          onChange={() => setImportFormat("json")}
                        />
                        <label htmlFor="json-format">JSON</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="csv-format"
                          checked={importFormat === "csv"}
                          onChange={() => setImportFormat("csv")}
                        />
                        <label htmlFor="csv-format">CSV</label>
                      </div>
                      <Button variant="outline" onClick={handleGenerateJsonTemplate} className="ml-auto">
                        <Copy className="h-4 w-4 mr-2" /> Copy {importFormat.toUpperCase()} Template
                      </Button>
                    </div>

                    <Textarea
                      placeholder={`Paste your ${importFormat.toUpperCase()} data here...`}
                      className="min-h-[200px]"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                    />

                    {importErrors.length > 0 && (
                      <div className="bg-destructive/10 p-4 rounded-md">
                        <h4 className="font-medium text-destructive mb-2">Import Errors:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {importErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button onClick={handleImportWords}>
                      <Upload className="h-4 w-4 mr-2" /> Import Words
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="export">
                  <div className="space-y-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="json">
                        <AccordionTrigger>JSON Format</AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                            {`[
  {
    "word": "Example",
    "definition": "A thing characteristic of its kind or illustrating a general rule.",
    "literaryDefinition": "A representative instance that illuminates broader truths.",
    "partOfSpeech": "noun",
    "example": "The author used the changing seasons as an example of life's cyclical nature.",
    "synonyms": ["instance", "sample", "illustration", "case"],
    "tags": ["descriptive", "educational", "reference"],
    "category": "descriptions",
    "difficulty": "beginner"
  }
]`}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="csv">
                        <AccordionTrigger>CSV Format</AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                            {`word,definition,literaryDefinition,partOfSpeech,example,synonyms,tags,category,difficulty
Example,A thing characteristic of its kind or illustrating a general rule.,A representative instance that illuminates broader truths.,noun,The author used the changing seasons as an example of life's cyclical nature.,instance;sample;illustration;case,descriptive;educational;reference,descriptions,beginner`}
                          </pre>
                          <p className="text-sm mt-2">
                            Note: For CSV format, separate multiple values (synonyms, tags) with semicolons (;)
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="ts">
                        <AccordionTrigger>TypeScript Format</AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                            {`export const newWords: WordEntry[] = [
  {
    id: "unique-id-1",
    word: "Example",
    definition": "A thing characteristic of its kind or illustrating a general rule.",
    "literaryDefinition": "A representative instance that illuminates broader truths.",
    "partOfSpeech": "noun",
    "example": "The author used the changing seasons as an example of life's cyclical nature.",
    "synonyms": ["instance", "sample", "illustration", "case"],
    "tags": ["descriptive", "educational", "reference"],
    "category": "descriptions",
    "difficulty": "beginner",
  }
]`}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search words..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTIES.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => (
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
                        <DropdownMenuItem
                          key={deck.id}
                          onClick={() => handleAddToDeck(deck.id, word)}
                          disabled={addingToDecks[deck.id]}
                        >
                          {addingToDecks[deck.id] ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <BookOpen className="h-4 w-4 mr-2" />
                          )}
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

        {filteredWords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No words match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
