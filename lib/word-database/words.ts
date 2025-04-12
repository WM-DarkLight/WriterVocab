// Word database structure
export interface WordEntry {
  id: string
  word: string
  definition: string
  literaryDefinition: string
  partOfSpeech: string
  example: string
  synonyms: string[]
  tags: string[]
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

// Collection structure
export interface WordCollection {
  id: string
  name: string
  description: string
  words: WordEntry[]
}

// Categories for organization
export const CATEGORIES = [
  "emotions",
  "descriptions",
  "classical",
  "gothic",
  "action",
  "nature",
  "abstract",
  "character",
] as const

export type WordCategory = (typeof CATEGORIES)[number]

// Difficulty levels
export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const
export type WordDifficulty = (typeof DIFFICULTIES)[number]

// Parts of speech
export const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
] as const

export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number]

// Collection data with words
export const collections: WordCollection[] = [
  {
    id: "emotions",
    name: "Emotions",
    description: "Words that evoke and describe complex emotional states.",
    words: [
      {
        id: "e1",
        word: "Melancholy",
        definition: "A feeling of pensive sadness, typically with no obvious cause.",
        literaryDefinition: "A bittersweet sorrow that colors perception with shades of wistful reflection.",
        partOfSpeech: "noun",
        example: "A profound melancholy permeated the final chapters, as the protagonist reflected on all he had lost.",
        synonyms: ["sadness", "sorrow", "wistfulness", "despondency"],
        tags: ["emotions", "mood", "tone"],
        category: "emotions",
        difficulty: "intermediate",
      },
      {
        id: "e2",
        word: "Euphoria",
        definition: "A feeling or state of intense excitement and happiness.",
        literaryDefinition:
          "An overwhelming sense of joy that transcends ordinary happiness, often fleeting and intense.",
        partOfSpeech: "noun",
        example: "The euphoria of their reunion was captured in prose that seemed to vibrate with energy on the page.",
        synonyms: ["elation", "joy", "delight", "ecstasy"],
        tags: ["emotions", "positive", "intense"],
        category: "emotions",
        difficulty: "intermediate",
      },
      {
        id: "e3",
        word: "Ennui",
        definition: "A feeling of listlessness and dissatisfaction arising from a lack of occupation or excitement.",
        literaryDefinition:
          "The peculiar lethargy of a soul that finds itself trapped in tedium, yearning for meaning.",
        partOfSpeech: "noun",
        example:
          "The character's ennui reflected the spiritual emptiness of the post-war generation the novel portrayed.",
        synonyms: ["boredom", "tedium", "listlessness", "languor"],
        tags: ["emotions", "negative", "existential"],
        category: "emotions",
        difficulty: "advanced",
      },
      {
        id: "e4",
        word: "Trepidation",
        definition: "A feeling of fear or anxiety about something that may happen.",
        literaryDefinition:
          "The trembling anticipation of potential danger, like the first vibrations before an earthquake.",
        partOfSpeech: "noun",
        example:
          "She approached the abandoned house with trepidation, each step forward a battle against her instinct to flee.",
        synonyms: ["fear", "dread", "anxiety", "apprehension"],
        tags: ["emotions", "fear", "anticipation"],
        category: "emotions",
        difficulty: "intermediate",
      },
      {
        id: "e5",
        word: "Wistful",
        definition: "Having or showing a feeling of vague or regretful longing.",
        literaryDefinition:
          "Touched by gentle yearning for what is past or distant, like looking through rain-streaked windows at a fading light.",
        partOfSpeech: "adjective",
        example: "The memoir ended on a wistful note, acknowledging that some doors to the past can never be reopened.",
        synonyms: ["yearning", "longing", "nostalgic", "pensive"],
        tags: ["emotions", "reflective", "melancholy"],
        category: "emotions",
        difficulty: "intermediate",
      },
    ],
  },
  {
    id: "descriptions",
    name: "Descriptions",
    description: "Vivid adjectives and phrases for detailed scene-setting.",
    words: [
      {
        id: "d1",
        word: "Ephemeral",
        definition: "Lasting for a very short time.",
        literaryDefinition: "Fleeting moments that dissolve like morning mist, leaving only traces of memory.",
        partOfSpeech: "adjective",
        example:
          "The ephemeral beauty of cherry blossoms served as a central metaphor in her novel about life's impermanence.",
        synonyms: ["fleeting", "transitory", "momentary", "brief"],
        tags: ["descriptive", "poetic", "time"],
        category: "descriptions",
        difficulty: "intermediate",
      },
      {
        id: "d2",
        word: "Labyrinthine",
        definition: "Resembling a labyrinth in form or complexity.",
        literaryDefinition: "Intricate pathways of narrative or thought that wind and twist upon themselves.",
        partOfSpeech: "adjective",
        example: "The detective navigated the labyrinthine plot, where each clue led to more questions than answers.",
        synonyms: ["complex", "intricate", "convoluted", "maze-like"],
        tags: ["descriptive", "structure", "complexity"],
        category: "descriptions",
        difficulty: "advanced",
      },
      {
        id: "d3",
        word: "Susurration",
        definition: "Whispering, murmuring, or rustling.",
        literaryDefinition: "The gentle music of whispers or soft sounds that hint at secrets or natural mysteries.",
        partOfSpeech: "noun",
        example:
          "The susurration of leaves in the forest created an atmosphere of ancient secrets and hidden watchers.",
        synonyms: ["whisper", "murmur", "rustle", "sigh"],
        tags: ["sound", "nature", "atmosphere"],
        category: "descriptions",
        difficulty: "advanced",
      },
      {
        id: "d4",
        word: "Gossamer",
        definition: "A fine, filmy substance consisting of cobwebs; something very light, delicate, or insubstantial.",
        literaryDefinition:
          "Delicacy so fine it seems woven from light itself; the barely-there boundary between presence and absence.",
        partOfSpeech: "noun",
        example: "Her prose had a gossamer quality, touching on profound truths with the lightest of touches.",
        synonyms: ["delicate", "fine", "light", "insubstantial"],
        tags: ["descriptive", "texture", "lightness"],
        category: "descriptions",
        difficulty: "intermediate",
      },
      {
        id: "d5",
        word: "Petrichor",
        definition: "The pleasant smell that accompanies the first rain after a long period of warm, dry weather.",
        literaryDefinition: "The earth's perfume released by rain, evoking primal memory and renewal.",
        partOfSpeech: "noun",
        example:
          "The petrichor rising from the parched earth signaled the end of the drought that had served as a metaphor throughout the novel.",
        synonyms: ["rain-scent", "earth-smell", "geosmin"],
        tags: ["sensory", "nature", "specific"],
        category: "descriptions",
        difficulty: "advanced",
      },
    ],
  },
  {
    id: "gothic",
    name: "Gothic",
    description: "Dark, atmospheric words perfect for mystery and horror.",
    words: [
      {
        id: "g1",
        word: "Phantasmagoria",
        definition: "A sequence of real or imaginary images like those seen in a dream.",
        literaryDefinition: "A dreamlike blur of shifting illusions and impressions that defy rational explanation.",
        partOfSpeech: "noun",
        example:
          "The fever induced a phantasmagoria of memories and fears that the author described in vivid, fragmented prose.",
        synonyms: ["illusion", "fantasy", "hallucination", "dream-sequence"],
        tags: ["surreal", "imagery", "perception"],
        category: "gothic",
        difficulty: "advanced",
      },
      {
        id: "g2",
        word: "Tenebrous",
        definition: "Dark, shadowy, or obscure.",
        literaryDefinition:
          "Shrouded in shadows that conceal as much as they reveal, suggesting mystery or foreboding.",
        partOfSpeech: "adjective",
        example:
          "The protagonist descended into the tenebrous catacombs, where ancient secrets lay buried in darkness.",
        synonyms: ["dark", "gloomy", "murky", "shadowy"],
        tags: ["atmosphere", "gothic", "description"],
        category: "gothic",
        difficulty: "advanced",
      },
      {
        id: "g3",
        word: "Macabre",
        definition: "Disturbing and horrifying because of involvement with or depiction of death and injury.",
        literaryDefinition:
          "The aesthetic where beauty and horror dance together, revealing the thin membrane between life and death.",
        partOfSpeech: "adjective",
        example: "The author's macabre descriptions transformed ordinary objects into omens of impending doom.",
        synonyms: ["gruesome", "grisly", "ghastly", "horrifying"],
        tags: ["gothic", "horror", "death"],
        category: "gothic",
        difficulty: "intermediate",
      },
    ],
  },
  {
    id: "action",
    name: "Action",
    description: "Dynamic verbs and expressions to energize action sequences.",
    words: [
      {
        id: "a1",
        word: "Cacophony",
        definition: "A harsh, discordant mixture of sounds.",
        literaryDefinition: "A storm of clashing sounds that assaults the senses and evokes chaos or conflict.",
        partOfSpeech: "noun",
        example: "The battle scene was written as a cacophony of screams, clashing metal, and thundering hooves.",
        synonyms: ["discord", "dissonance", "noise", "clamor"],
        tags: ["sound", "conflict", "sensory"],
        category: "action",
        difficulty: "intermediate",
      },
      {
        id: "a2",
        word: "Eviscerate",
        definition: "Disembowel or remove the internal organs of; figuratively, to deprive of vital content.",
        literaryDefinition:
          "To tear out the heart of something, leaving it hollow; to critique with devastating precision.",
        partOfSpeech: "verb",
        example: "Her critical review eviscerated the novel, exposing its logical flaws and stylistic weaknesses.",
        synonyms: ["disembowel", "gut", "remove", "hollow out"],
        tags: ["violent", "critique", "destruction"],
        category: "action",
        difficulty: "intermediate",
      },
      {
        id: "a3",
        word: "Maelstrom",
        definition:
          "A powerful whirlpool in the sea or a river; a situation or state of confused movement or violent turmoil.",
        literaryDefinition: "The vortex at the center of chaos, drawing all elements into its destructive spiral.",
        partOfSpeech: "noun",
        example:
          "The protagonist was caught in a maelstrom of conflicting loyalties, each pulling him toward a different fate.",
        synonyms: ["whirlpool", "vortex", "turmoil", "tumult"],
        tags: ["chaos", "conflict", "movement"],
        category: "action",
        difficulty: "intermediate",
      },
    ],
  },
  {
    id: "classical",
    name: "Classical",
    description: "Timeless vocabulary from literary classics and scholarly works.",
    words: [
      {
        id: "c1",
        word: "Quintessential",
        definition: "Representing the most perfect or typical example of a quality or class.",
        literaryDefinition: "The distilled essence of something, pure and unalloyed by imperfection.",
        partOfSpeech: "adjective",
        example:
          "She was the quintessential unreliable narrator, leading readers through a maze of half-truths and omissions.",
        synonyms: ["archetypal", "classic", "exemplary", "definitive"],
        tags: ["descriptive", "character", "concept"],
        category: "classical",
        difficulty: "intermediate",
      },
      {
        id: "c2",
        word: "Juxtapose",
        definition: "To place or deal with close together for contrasting effect.",
        literaryDefinition:
          "To create meaning through contrast, placing unlike things side by side to illuminate both.",
        partOfSpeech: "verb",
        example:
          "The author juxtaposed scenes of domestic tranquility with the brewing violence, heightening the sense of impending doom.",
        synonyms: ["contrast", "compare", "set side by side", "counterpose"],
        tags: ["structure", "technique", "contrast"],
        category: "classical",
        difficulty: "intermediate",
      },
      {
        id: "c3",
        word: "Apotheosis",
        definition: "The highest point in the development of something; culmination or climax.",
        literaryDefinition: "The moment when something reaches its perfect form, transcending ordinary limitations.",
        partOfSpeech: "noun",
        example: "The final chapter represented the apotheosis of the protagonist's journey from ignorance to wisdom.",
        synonyms: ["pinnacle", "culmination", "peak", "zenith"],
        tags: ["structure", "climax", "transformation"],
        category: "classical",
        difficulty: "advanced",
      },
    ],
  },
]

// Additional words that aren't part of specific collections
export const additionalWords: WordEntry[] = [
  {
    id: "1",
    word: "Ineffable",
    definition: "Too great or extreme to be expressed or described in words.",
    literaryDefinition: "That which lies beyond the reach of language, where only silence or art can speak.",
    partOfSpeech: "adjective",
    example: "The poet struggled to capture the ineffable beauty of the moment when time seemed to stand still.",
    synonyms: ["indescribable", "inexpressible", "unspeakable", "beyond words"],
    tags: ["descriptive", "abstract", "spiritual"],
    category: "descriptions",
    difficulty: "advanced",
  },
]

// Helper function to generate a unique ID for new words
export function generateWordId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
}

// Helper function to create a new word entry
export function createWordEntry(
  word: string,
  definition: string,
  literaryDefinition: string,
  partOfSpeech: PartOfSpeech,
  example: string,
  synonyms: string[],
  tags: string[],
  category: WordCategory,
  difficulty: WordDifficulty,
): WordEntry {
  return {
    id: generateWordId(),
    word,
    definition,
    literaryDefinition,
    partOfSpeech,
    example,
    synonyms,
    tags,
    category,
    difficulty,
  }
}

// Get all words from all collections and additional words
export function getAllWords(): WordEntry[] {
  const collectionWords = collections.flatMap((collection) => collection.words)
  return [...collectionWords, ...additionalWords]
}

// Get a specific collection by ID
export function getCollection(id: string): WordCollection | undefined {
  return collections.find((collection) => collection.id === id)
}

// Get all collections
export function getAllCollections(): WordCollection[] {
  return collections
}
