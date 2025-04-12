"use client"

import { useEffect, useState } from "react"
import { openDB, type IDBPDatabase } from "idb"

export const useDB = () => {
  const [db, setDb] = useState<IDBPDatabase | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB("writerVocabDB", 1)
        setDb(database)
        setInitialized(true)
      } catch (error) {
        console.error("Error initializing database:", error)
      }
    }

    if (!db) {
      initDB()
    }

    return () => {
      if (db) {
        db.close()
      }
    }
  }, [db])

  return db
}
