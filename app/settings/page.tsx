"use client"

import { useState, useEffect } from "react"
import { Download, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { useDatabase } from "@/components/database-provider"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const { exportDeck, importDeck, getUserDecks, db } = useDatabase()

  const [autoPlayAudio, setAutoPlayAudio] = useState(false)
  const [spaceRepetition, setSpaceRepetition] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadSettings = async () => {
      if (!db) return

      try {
        const settings = await db.get("userPreferences", "studySettings")
        if (settings) {
          if (typeof settings.autoPlayAudio === "boolean") {
            setAutoPlayAudio(settings.autoPlayAudio)
          }
          if (typeof settings.spaceRepetition === "boolean") {
            setSpaceRepetition(settings.spaceRepetition)
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setSettingsLoaded(true)
      }
    }

    loadSettings()
  }, [db])

  const saveSettings = async (key, value) => {
    if (!db) return

    try {
      const settings = (await db.get("userPreferences", "studySettings")) || { id: "studySettings" }
      await db.put("userPreferences", {
        ...settings,
        [key]: value,
      })
    } catch (error) {
      console.error(`Error saving ${key} setting:`, error)
      toast({
        title: "Settings Error",
        description: "Failed to save your settings.",
        variant: "destructive",
      })
    }
  }

  const handleAutoPlayChange = (checked) => {
    setAutoPlayAudio(checked)
    saveSettings("autoPlayAudio", checked)
  }

  const handleSpaceRepetitionChange = (checked) => {
    setSpaceRepetition(checked)
    saveSettings("spaceRepetition", checked)
  }

  const handleExportAllData = async () => {
    try {
      setExportLoading(true)

      // Get all decks
      const decks = await getUserDecks()

      // Export each deck
      const exportData = {
        decks: await Promise.all(
          decks.map(async (deck) => {
            const deckExport = await exportDeck(deck.id)
            return {
              ...deckExport,
              id: deck.id,
            }
          }),
        ),
        settings: {
          autoPlayAudio,
          spaceRepetition,
          theme,
        },
      }

      // Create a downloadable file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = "writervocab-export.json"

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Data exported",
        description: "All your data has been exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export failed",
        description: "There was a problem exporting your data.",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleImportData = () => {
    // Create a file input element
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".json"

    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement
      if (!target.files || target.files.length === 0) return

      const file = target.files[0]

      try {
        setImportLoading(true)

        const reader = new FileReader()
        reader.onload = async (e) => {
          const content = e.target?.result as string
          const importData = JSON.parse(content)

          // Import each deck
          if (importData.decks && Array.isArray(importData.decks)) {
            for (const deck of importData.decks) {
              await importDeck(deck)
            }
          }

          // Import settings
          if (importData.settings) {
            if (importData.settings.theme) {
              setTheme(importData.settings.theme)
            }
            if (typeof importData.settings.autoPlayAudio === "boolean") {
              setAutoPlayAudio(importData.settings.autoPlayAudio)
            }
            if (typeof importData.settings.spaceRepetition === "boolean") {
              setSpaceRepetition(importData.settings.spaceRepetition)
            }
          }

          toast({
            title: "Data imported",
            description: "Your data has been imported successfully.",
          })
        }

        reader.readAsText(file)
      } catch (error) {
        console.error("Error importing data:", error)
        toast({
          title: "Import failed",
          description: "There was a problem importing your data.",
          variant: "destructive",
        })
      } finally {
        setImportLoading(false)
      }
    }

    fileInput.click()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how WriterVocab looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
                </div>
                <Switch
                  id="theme"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light")
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
              <CardDescription>Customize your study experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoPlayAudio">Auto-play Pronunciation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically play word pronunciation when viewing cards.
                  </p>
                </div>
                <Switch id="autoPlayAudio" checked={autoPlayAudio} onCheckedChange={handleAutoPlayChange} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="spaceRepetition">Spaced Repetition</Label>
                  <p className="text-sm text-muted-foreground">
                    Use spaced repetition algorithm for optimized learning.
                  </p>
                </div>
                <Switch id="spaceRepetition" checked={spaceRepetition} onCheckedChange={handleSpaceRepetitionChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or import your vocabulary data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Export all your decks and settings as a JSON file, or import previously exported data.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="gap-1" onClick={handleExportAllData} disabled={exportLoading}>
                    <Download className="h-4 w-4" />
                    {exportLoading ? "Exporting..." : "Export All Data"}
                  </Button>
                  <Button variant="outline" className="gap-1" onClick={handleImportData} disabled={importLoading}>
                    <Upload className="h-4 w-4" />
                    {importLoading ? "Importing..." : "Import Data"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
