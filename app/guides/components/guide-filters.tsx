"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Filter options
const expertiseOptions = [
  { id: "royal-history", label: "Royal History" },
  { id: "architecture", label: "Architecture" },
  { id: "art-history", label: "Art History" },
  { id: "cultural-history", label: "Cultural History" },
  { id: "royal-traditions", label: "Royal Traditions" },
  { id: "regional-history", label: "Regional History" },
]

const languageOptions = [
  { id: "english", label: "English" },
  { id: "hindi", label: "Hindi" },
  { id: "gujarati", label: "Gujarati" },
  { id: "marathi", label: "Marathi" },
  { id: "french", label: "French" },
]

export default function GuideFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get current filter values from URL
  const currentExpertise = searchParams.get("expertise") || ""
  const currentLanguage = searchParams.get("language") || ""
  const currentSearch = searchParams.get("search") || ""

  // Local state for filters
  const [selectedExpertise, setSelectedExpertise] = useState(currentExpertise)
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage)
  const [searchQuery, setSearchQuery] = useState(currentSearch)

  // Apply filters
  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams()

      if (selectedExpertise) params.set("expertise", selectedExpertise)
      if (selectedLanguage) params.set("language", selectedLanguage)
      if (searchQuery) params.set("search", searchQuery)

      router.push(`/guides?${params.toString()}`)
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedExpertise("")
    setSelectedLanguage("")
    setSearchQuery("")

    startTransition(() => {
      router.push("/guides")
    })
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Find Your Guide</h2>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["expertise", "language"]} className="w-full">
        <AccordionItem value="expertise">
          <AccordionTrigger>Expertise</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {expertiseOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`expertise-${option.id}`}
                    checked={selectedExpertise === option.id}
                    onCheckedChange={() => setSelectedExpertise(selectedExpertise === option.id ? "" : option.id)}
                  />
                  <Label
                    htmlFor={`expertise-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="language">
          <AccordionTrigger>Language</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {languageOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`language-${option.id}`}
                    checked={selectedLanguage === option.id}
                    onCheckedChange={() => setSelectedLanguage(selectedLanguage === option.id ? "" : option.id)}
                  />
                  <Label
                    htmlFor={`language-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col space-y-2 mt-6">
        <Button onClick={applyFilters} disabled={isPending}>
          Apply Filters
        </Button>
        <Button variant="outline" onClick={resetFilters} disabled={isPending}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}

