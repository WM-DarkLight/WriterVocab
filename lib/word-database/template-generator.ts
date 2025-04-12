import type { WordCategory, WordDifficulty, PartOfSpeech } from "./words"

// Generate a template for a single word
export function generateWordTemplate(
  category: WordCategory,
  difficulty: WordDifficulty,
  partOfSpeech: PartOfSpeech,
): string {
  return `{
  id: "${Date.now().toString(36)}",
  word: "",
  definition: "",
  literaryDefinition: "",
  partOfSpeech: "${partOfSpeech}",
  example: "",
  synonyms: ["", "", ""],
  tags: ["", "", ""],
  category: "${category}",
  difficulty: "${difficulty}"
},`
}

// Generate templates for multiple words
export function generateMultipleTemplates(count: number, category: WordCategory): string {
  let templates = ""

  for (let i = 0; i < count; i++) {
    templates += `{
  id: "${Date.now().toString(36) + i}",
  word: "",
  definition: "",
  literaryDefinition: "",
  partOfSpeech: "",
  example: "",
  synonyms: ["", "", ""],
  tags: ["", "", ""],
  category: "${category}",
  difficulty: ""
},\n`
  }

  return templates
}

// Generate a CSV template header
export function generateCsvTemplate(): string {
  return "word,definition,literaryDefinition,partOfSpeech,example,synonyms,tags,category,difficulty"
}

// Generate a JSON template
export function generateJsonTemplate(count: number): string {
  const words = []

  for (let i = 0; i < count; i++) {
    words.push({
      word: "",
      definition: "",
      literaryDefinition: "",
      partOfSpeech: "",
      example: "",
      synonyms: ["", "", ""],
      tags: ["", "", ""],
      category: "",
      difficulty: "",
    })
  }

  return JSON.stringify(words, null, 2)
}
