"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { openDB, type IDBPDatabase } from "idb"
import { useToast } from "@/components/ui/use-toast"

interface DatabaseContextType {
  db: IDBPDatabase | null
  initialized: boolean
  getUserDecks: () => Promise<any[]>
  getDeck: (deckId: string) => Promise<any>
  createDeck: (deck: any) => Promise<string>
  updateDeck: (deckId: string, deck: any) => Promise<void>
  deleteDeck: (deckId: string) => Promise<void>
  getCardsInDeck: (deckId: string) => Promise<any[]>
  addCard: (deckId: string, card: any) => Promise<string>
  updateCard: (cardId: string, card: any) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
  addToUserDeck: (deckId: string, word: any) => Promise<void>
  exportDeck: (deckId: string) => Promise<any>
  importDeck: (deck: any) => Promise<string>
  getUserPreferences: () => Promise<any>
  updateUserPreferences: (prefs: any) => Promise<void>
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  initialized: false,
  getUserDecks: async () => [],
  getDeck: async () => ({}),
  createDeck: async () => "",
  updateDeck: async () => {},
  deleteDeck: async () => {},
  getCardsInDeck: async () => [],
  addCard: async () => "",
  updateCard: async () => {},
  deleteCard: async () => {},
  addToUserDeck: async () => {},
  exportDeck: async () => ({}),
  importDeck: async () => "",
  getUserPreferences: async () => ({}),
  updateUserPreferences: async () => {},
})

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<IDBPDatabase | null>(null)
  const [initialized, setInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initDB = async () => {
      try {
        console.log("Initializing database...")
        const database = await openDB("writerVocabDB", 1, {
          upgrade(db) {
            console.log("Upgrading database schema...")
            // Create stores
            if (!db.objectStoreNames.contains("decks")) {
              console.log("Creating decks store...")
              const deckStore = db.createObjectStore("decks", { keyPath: "id", autoIncrement: true })
              deckStore.createIndex("name", "name", { unique: false })
              deckStore.createIndex("createdAt", "createdAt", { unique: false })
            }

            if (!db.objectStoreNames.contains("cards")) {
              console.log("Creating cards store...")
              const cardStore = db.createObjectStore("cards", { keyPath: "id", autoIncrement: true })
              cardStore.createIndex("word", "word", { unique: false })
              cardStore.createIndex("deckId", "deckId", { unique: false })
              cardStore.createIndex("createdAt", "createdAt", { unique: false })
            }

            if (!db.objectStoreNames.contains("userPreferences")) {
              console.log("Creating userPreferences store...")
              db.createObjectStore("userPreferences", { keyPath: "id" })
            }
          },
        })

        setDb(database)
        console.log("Database initialized successfully")

        // Add sample data if the database is empty
        const deckCount = await database.count("decks")
        console.log("Current deck count:", deckCount)

        if (deckCount === 0) {
          console.log("Adding sample data...")
          // Add sample decks
          const favoritesId = await database.add("decks", {
            name: "Favorites",
            description: "Your saved favorite words",
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: 0,
          })
          console.log("Created Favorites deck with ID:", favoritesId)

          const customDeckId = await database.add("decks", {
            name: "My Custom Vocabulary",
            description: "Personal collection of useful words",
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: 0,
          })
          console.log("Created Custom deck with ID:", customDeckId)

          // Add sample cards to the custom deck
          const card1Id = await database.add("cards", {
            deckId: customDeckId,
            word: "Serendipity",
            definition: "The occurrence and development of events by chance in a happy or beneficial way.",
            literaryDefinition: "A fortunate accident that leads to an unexpected discovery or blessing.",
            partOfSpeech: "noun",
            example:
              "By serendipity, the author stumbled upon an ancient manuscript that would inspire her next novel.",
            synonyms: ["chance", "fate", "providence", "luck"],
            tags: ["positive", "literary", "elegant"],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastReviewed: null,
            reviewCount: 0,
            difficulty: "intermediate",
          })
          console.log("Added card 1 with ID:", card1Id)

          const card2Id = await database.add("cards", {
            deckId: customDeckId,
            word: "Mellifluous",
            definition: "Sweet or musical; pleasant to hear.",
            literaryDefinition:
              "Language that flows with honey-like sweetness, enchanting the ear and soothing the soul.",
            partOfSpeech: "adjective",
            example:
              "The poet's mellifluous verses captivated the audience, their rhythm as soothing as a gentle stream.",
            synonyms: ["melodious", "euphonious", "harmonious", "sweet-sounding"],
            tags: ["descriptive", "poetic", "sound"],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastReviewed: null,
            reviewCount: 0,
            difficulty: "advanced",
          })
          console.log("Added card 2 with ID:", card2Id)

          // Update the word count
          await database.put("decks", {
            id: customDeckId,
            name: "My Custom Vocabulary",
            description: "Personal collection of useful words",
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: 2,
          })
          console.log("Updated deck word count")

          // Initialize user preferences
          await database.put("userPreferences", {
            id: "user-prefs",
            autoPlayAudio: false,
            spaceRepetition: true,
          })
          console.log("Initialized user preferences")
        }

        setInitialized(true)
        console.log("Database provider fully initialized")
      } catch (error) {
        console.error("Error initializing database:", error)
        toast({
          title: "Database Error",
          description: "Failed to initialize the database. Some features may not work properly.",
          variant: "destructive",
        })
      }
    }

    if (!db && typeof window !== "undefined") {
      initDB()
    }

    return () => {
      if (db) {
        console.log("Closing database connection")
        db.close()
      }
    }
  }, [toast])

  const getUserDecks = async () => {
    if (!db) {
      console.warn("Database not initialized when trying to get user decks")
      return []
    }

    try {
      const decks = await db.getAll("decks")
      console.log("Retrieved user decks:", decks)
      return decks
    } catch (error) {
      console.error("Error getting decks:", error)
      return []
    }
  }

  const getDeck = async (deckId: string) => {
    if (!db) {
      console.warn(`Database not initialized when trying to get deck ${deckId}`)
      return null
    }

    try {
      // Convert deckId to number if it's a string containing only digits
      const id = /^\d+$/.test(deckId) ? Number.parseInt(deckId, 10) : deckId
      console.log(`Getting deck with ID: ${id} (original: ${deckId})`)

      const deck = await db.get("decks", id)
      console.log("Retrieved deck:", deck)
      return deck
    } catch (error) {
      console.error(`Error getting deck ${deckId}:`, error)
      return null
    }
  }

  const createDeck = async (deck: any) => {
    if (!db) {
      console.warn("Database not initialized when trying to create deck")
      throw new Error("Database not initialized")
    }

    try {
      const newDeck = {
        ...deck,
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 0,
      }

      const deckId = await db.add("decks", newDeck)
      console.log("Created deck with ID:", deckId)
      return deckId.toString()
    } catch (error) {
      console.error("Error creating deck:", error)
      throw error
    }
  }

  const updateDeck = async (deckId: string, deck: any) => {
    if (!db) {
      console.warn(`Database not initialized when trying to update deck ${deckId}`)
      throw new Error("Database not initialized")
    }

    try {
      // Convert deckId to number if it's a string containing only digits
      const id = /^\d+$/.test(deckId) ? Number.parseInt(deckId, 10) : deckId
      console.log(`Updating deck with ID: ${id} (original: ${deckId})`)

      const existingDeck = await db.get("decks", id)
      if (!existingDeck) {
        console.error(`Deck not found: ${id}`)
        throw new Error("Deck not found")
      }

      const updatedDeck = {
        ...existingDeck,
        ...deck,
        id: id,
        updatedAt: new Date(),
      }

      await db.put("decks", updatedDeck)
      console.log("Updated deck:", updatedDeck)
    } catch (error) {
      console.error(`Error updating deck ${deckId}:`, error)
      throw error
    }
  }

  const deleteDeck = async (deckId: string) => {
    if (!db) {
      console.warn(`Database not initialized when trying to delete deck ${deckId}`)
      throw new Error("Database not initialized")
    }

    try {
      // Convert deckId to number if it's a string containing only digits
      const id = /^\d+$/.test(deckId) ? Number.parseInt(deckId, 10) : deckId
      console.log(`Deleting deck with ID: ${id} (original: ${deckId})`)

      // First delete all cards in the deck
      const cards = await db.getAllFromIndex("cards", "deckId", id)
      console.log(`Deleting ${cards.length} cards from deck ${id}`)

      for (const card of cards) {
        await db.delete("cards", card.id)
      }

      // Then delete the deck
      await db.delete("decks", id)
      console.log(`Deleted deck ${id}`)
    } catch (error) {
      console.error(`Error deleting deck ${deckId}:`, error)
      throw error
    }
  }

  const getCardsInDeck = async (deckId: string) => {
    if (!db) {
      console.warn(`Database not initialized when trying to get cards for deck ${deckId}`)
      return []
    }

    try {
      // Convert deckId to number if it's a string containing only digits
      const id = /^\d+$/.test(deckId) ? Number.parseInt(deckId, 10) : deckId
      console.log(`Getting cards for deck with ID: ${id} (original: ${deckId})`)

      const cards = await db.getAllFromIndex("cards", "deckId", id)
      console.log(`Retrieved ${cards.length} cards for deck ${id}`)
      return cards
    } catch (error) {
      console.error(`Error getting cards for deck ${deckId}:`, error)
      return []
    }
  }

  const addCard = async (deckId: string, card: any) => {
    if (!db) {
      console.warn(`Database not initialized when trying to add card to deck ${deckId}`)
      throw new Error("Database not initialized")
    }

    try {
      // Convert deckId to number if it's a string containing only digits
      const id = /^\d+$/.test(deckId) ? Number.parseInt(deckId, 10) : deckId
      console.log(`Adding card to deck with ID: ${id} (original: ${deckId})`)

      const newCard = {
        ...card,
        deckId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastReviewed: null,
        reviewCount: 0,
      }

      const cardId = await db.add("cards", newCard)
      console.log(`Added card with ID: ${cardId} to deck ${id}`)

      // Update word count in the deck
      const deck = await db.get("decks", id)
      if (deck) {
        deck.wordCount = (deck.wordCount || 0) + 1
        deck.updatedAt = new Date()
        await db.put("decks", deck)
        console.log(`Updated word count for deck ${id} to ${deck.wordCount}`)
      }

      return cardId.toString()
    } catch (error) {
      console.error(`Error adding card to deck ${deckId}:`, error)
      throw error
    }
  }

  const updateCard = async (cardId: string, card: any) => {
    if (!db) {
      console.warn(`Database not initialized when trying to update card ${cardId}`)
      throw new Error("Database not initialized")
    }

    try {
      // Convert cardId to number if it's a string containing only digits
      const id = /^\d+$/.test(cardId) ? Number.parseInt(cardId, 10) : cardId
      console.log(`Updating card with ID: ${id} (original: ${cardId})`)

      const existingCard = await db.get("cards", id)
      if (!existingCard) {
        console.error(`Card not found: ${id}`)
        throw new Error("Card not found")
      }

      const updatedCard = {
        ...existingCard,
        ...card,
        id: id,
        updatedAt: new Date(),
      }

      await db.put("cards", updatedCard)
      console.log(`Updated card: ${id}`)
    } catch (error) {
      console.error(`Error updating card ${cardId}:`, error)
      throw error
    }
  }

  const deleteCard = async (cardId: string) => {
    if (!db) {
      console.warn(`Database not initialized when trying to delete card ${cardId}`)
      throw new Error("Database not initialized")
    }

    try {
      // Convert cardId to number if it's a string containing only digits
      const id = /^\d+$/.test(cardId) ? Number.parseInt(cardId, 10) : cardId
      console.log(`Deleting card with ID: ${id} (original: ${cardId})`)

      const card = await db.get("cards", id)
      if (!card) {
        console.error(`Card not found: ${id}`)
        throw new Error("Card not found")
      }

      await db.delete("cards", id)
      console.log(`Deleted card: ${id}`)

      // Update word count in the deck
      const deckId = card.deckId
      const deck = await db.get("decks", deckId)
      if (deck) {
        deck.wordCount = Math.max(0, (deck.wordCount || 0) - 1)
        deck.updatedAt = new Date()
        await db.put("decks", deck)
        console.log(`Updated word count for deck ${deckId} to ${deck.wordCount}`)
      }
    } catch (error) {
      console.error(`Error deleting card ${cardId}:`, error)
      throw error
    }
  }

  const addToUserDeck = async (deckId: string, word: any) => {
    if (!db) {
      console.warn(`Database not initialized when trying to add word to deck ${deckId}`)
      throw new Error("Database not initialized")
    }

    try {
      // Convert deckId to number if it's a string containing only digits
      const id = /^\d+$/.test(deckId) ? Number.parseInt(deckId, 10) : deckId
      console.log(`Adding word to deck with ID: ${id} (original: ${deckId})`)

      // Check if the deck exists
      const deck = await db.get("decks", id)
      if (!deck) {
        console.error(`Deck not found: ${id}`)
        throw new Error("Deck not found")
      }

      // Add the word as a card
      await addCard(id.toString(), word)
      console.log(`Added word "${word.word}" to deck ${id}`)
    } catch (error) {
      console.error(`Error adding word to deck ${deckId}:`, error)
      throw error
    }
  }

  const exportDeck = async (deckId: string) => {
    if (!db) {
      console.warn(`Database not initialized when trying to export deck ${deckId}`)
      throw new Error("Database not initialized")
    }

    try {
      // Convert deckId to number if it's a string containing only digits
      const id = /^\d+$/.test(deckId) ? Number.parseInt(deckId, 10) : deckId
      console.log(`Exporting deck with ID: ${id} (original: ${deckId})`)

      const deck = await db.get("decks", id)
      if (!deck) {
        console.error(`Deck not found: ${id}`)
        throw new Error("Deck not found")
      }

      const cards = await db.getAllFromIndex("cards", "deckId", id)
      console.log(`Exporting ${cards.length} cards from deck ${id}`)

      return {
        name: deck.name,
        description: deck.description,
        cards: cards.map((card) => ({
          word: card.word,
          definition: card.definition,
          literaryDefinition: card.literaryDefinition,
          partOfSpeech: card.partOfSpeech,
          example: card.example,
          synonyms: card.synonyms,
          tags: card.tags,
          difficulty: card.difficulty,
        })),
      }
    } catch (error) {
      console.error(`Error exporting deck ${deckId}:`, error)
      throw error
    }
  }

  const importDeck = async (deckData: any) => {
    if (!db) {
      console.warn("Database not initialized when trying to import deck")
      throw new Error("Database not initialized")
    }

    try {
      console.log("Importing deck:", deckData.name)

      // Create the deck
      const deckId = await createDeck({
        name: deckData.name,
        description: deckData.description || `Imported deck: ${deckData.name}`,
      })

      // Add all cards
      if (deckData.cards && Array.isArray(deckData.cards)) {
        console.log(`Importing ${deckData.cards.length} cards to deck ${deckId}`)
        for (const card of deckData.cards) {
          await addCard(deckId, card)
        }
      }

      return deckId
    } catch (error) {
      console.error("Error importing deck:", error)
      throw error
    }
  }

  const getUserPreferences = async () => {
    if (!db) {
      console.warn("Database not initialized when trying to get user preferences")
      return { autoPlayAudio: false, spaceRepetition: true }
    }

    try {
      const prefs = await db.get("userPreferences", "user-prefs")
      console.log("Retrieved user preferences:", prefs)

      if (!prefs) {
        // Initialize default preferences if not found
        const defaultPrefs = {
          id: "user-prefs",
          autoPlayAudio: false,
          spaceRepetition: true,
        }

        await db.put("userPreferences", defaultPrefs)
        console.log("Initialized default user preferences")
        return defaultPrefs
      }

      return prefs
    } catch (error) {
      console.error("Error getting user preferences:", error)
      return { autoPlayAudio: false, spaceRepetition: true }
    }
  }

  const updateUserPreferences = async (prefs: any) => {
    if (!db) {
      console.warn("Database not initialized when trying to update user preferences")
      throw new Error("Database not initialized")
    }

    try {
      const existingPrefs = await getUserPreferences()

      const updatedPrefs = {
        ...existingPrefs,
        ...prefs,
        id: "user-prefs",
      }

      await db.put("userPreferences", updatedPrefs)
      console.log("Updated user preferences:", updatedPrefs)
    } catch (error) {
      console.error("Error updating user preferences:", error)
      throw error
    }
  }

  return (
    <DatabaseContext.Provider
      value={{
        db,
        initialized,
        getUserDecks,
        getDeck,
        createDeck,
        updateDeck,
        deleteDeck,
        getCardsInDeck,
        addCard,
        updateCard,
        deleteCard,
        addToUserDeck,
        exportDeck,
        importDeck,
        getUserPreferences,
        updateUserPreferences,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => useContext(DatabaseContext)
