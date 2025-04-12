import {
  type WordEntry,
  type WordCategory,
  type WordDifficulty,
  type PartOfSpeech,
  CATEGORIES,
  DIFFICULTIES,
  PARTS_OF_SPEECH,
  generateWordId,
} from "./words"

interface ImportResult {
  words: WordEntry[]
  errors: string[]
}

// Parse JSON words
export function parseJsonWords(jsonData: string): ImportResult {
  const result: ImportResult = {
    words: [],
    errors: [],
  }

  try {
    const parsedData = JSON.parse(jsonData)

    if (!Array.isArray(parsedData)) {
      result.errors.push("JSON data must be an array of word objects")
      return result
    }

    parsedData.forEach((item, index) => {
      try {
        validateWordData(item, index)

        // Add ID if missing
        if (!item.id) {
          item.id = generateWordId()
        }

        result.words.push(item as WordEntry)
      } catch (error) {
        result.errors.push(`Word at index ${index}: ${(error as Error).message}`)
      }
    })

    return result
  } catch (error) {
    result.errors.push(`Invalid JSON: ${(error as Error).message}`)
    return result
  }
}

// Parse CSV words
export function parseCsvWords(csvData: string): ImportResult {
  const result: ImportResult = {
    words: [],
    errors: [],
  }

  try {
    const lines = csvData.split("\n").filter((line) => line.trim() !== "")

    if (lines.length < 2) {
      result.errors.push("CSV must contain a header row and at least one data row")
      return result
    }

    const headers = lines[0].split(",").map((h) => h.trim())
    const requiredFields = [
      "word",
      "definition",
      "literaryDefinition",
      "partOfSpeech",
      "example",
      "synonyms",
      "tags",
      "category",
      "difficulty",
    ]

    // Check if all required fields are present in the header
    const missingFields = requiredFields.filter((field) => !headers.includes(field))
    if (missingFields.length > 0) {
      result.errors.push(`Missing required fields in CSV header: ${missingFields.join(", ")}`)
      return result
    }

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])

        if (values.length !== headers.length) {
          result.errors.push(`Row ${i} has ${values.length} values but should have ${headers.length}`)
          continue
        }

        const wordData: Record<string, any> = {}
        headers.forEach((header, index) => {
          if (header === "synonyms" || header === "tags") {
            wordData[header] = values[index]
              .split(";")
              .map((v) => v.trim())
              .filter((v) => v !== "")
          } else {
            wordData[header] = values[index]
          }
        })

        validateWordData(wordData, i - 1)

        // Add ID
        wordData.id = generateWordId()

        result.words.push(wordData as WordEntry)
      } catch (error) {
        result.errors.push(`Row ${i}: ${(error as Error).message}`)
      }
    }

    return result
  } catch (error) {
    result.errors.push(`Error parsing CSV: ${(error as Error).message}`)
    return result
  }
}

// Helper function to parse CSV line considering quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let currentValue = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      values.push(currentValue.trim())
      currentValue = ""
    } else {
      currentValue += char
    }
  }

  // Add the last value
  values.push(currentValue.trim())

  return values
}

// Validate word data
function validateWordData(data: any, index: number): void {
  // Check required fields
  const requiredFields = [
    "word",
    "definition",
    "literaryDefinition",
    "partOfSpeech",
    "example",
    "synonyms",
    "tags",
    "category",
    "difficulty",
  ]

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Validate arrays
  if (!Array.isArray(data.synonyms)) {
    throw new Error("synonyms must be an array")
  }

  if (!Array.isArray(data.tags)) {
    throw new Error("tags must be an array")
  }

  // Validate category
  if (!CATEGORIES.includes(data.category as WordCategory)) {
    throw new Error(`Invalid category: ${data.category}. Must be one of: ${CATEGORIES.join(", ")}`)
  }

  // Validate difficulty
  if (!DIFFICULTIES.includes(data.difficulty as WordDifficulty)) {
    throw new Error(`Invalid difficulty: ${data.difficulty}. Must be one of: ${DIFFICULTIES.join(", ")}`)
  }

  // Validate part of speech
  if (!PARTS_OF_SPEECH.includes(data.partOfSpeech as PartOfSpeech)) {
    throw new Error(`Invalid part of speech: ${data.partOfSpeech}. Must be one of: ${PARTS_OF_SPEECH.join(", ")}`)
  }
}
