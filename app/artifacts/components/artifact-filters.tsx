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
const eras = [
  { id: "ancient", label: "Ancient (Pre-1700s)" },
  { id: "colonial", label: "Colonial Era (1700s-1947)" },
  { id: "modern", label: "Modern (Post-1947)" },
]

const types = [
  { id: "painting", label: "Paintings" },
  { id: "sculpture", label: "Sculptures" },
  { id: "jewelry", label: "Jewelry" },
  { id: "furniture", label: "Furniture" },
  { id: "weapon", label: "Weapons" },
  { id: "textile", label: "Textiles" },
  { id: "manuscript", label: "Manuscripts" },
]

const significance = [
  { id: "royal", label: "Royal Heritage" },
  { id: "cultural", label: "Cultural Significance" },
  { id: "historical", label: "Historical Events" },
  { id: "religious", label: "Religious Importance" },
]

export default function ArtifactFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get current filter values from URL
  const currentEra = searchParams.get("era") || ""
  const currentType = searchParams.get("type") || ""
  const currentSignificance = searchParams.get("significance") || ""
  const currentSearch = searchParams.get("search") || ""

  // Local state for filters
  const [selectedEra, setSelectedEra] = useState(currentEra)
  const [selectedType, setSelectedType] = useState(currentType)
  const [selectedSignificance, setSelectedSignificance] = useState(currentSignificance)
  const [searchQuery, setSearchQuery] = useState(currentSearch)

  // Apply filters
  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams()

      if (selectedEra) params.set("era", selectedEra)
      if (selectedType) params.set("type", selectedType)
      if (selectedSignificance) params.set("significance", selectedSignificance)
      if (searchQuery) params.set("search", searchQuery)

      router.push(`/artifacts?${params.toString()}`)
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedEra("")
    setSelectedType("")
    setSelectedSignificance("")
    setSearchQuery("")

    startTransition(() => {
      router.push("/artifacts")
    })
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Filter Artifacts</h2>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search artifacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["era", "type", "significance"]} className="w-full">
        <AccordionItem value="era">
          <AccordionTrigger>Era</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {eras.map((era) => (
                <div key={era.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`era-${era.id}`}
                    checked={selectedEra === era.id}
                    onCheckedChange={() => setSelectedEra(selectedEra === era.id ? "" : era.id)}
                  />
                  <Label
                    htmlFor={`era-${era.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {era.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger>Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {types.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={selectedType === type.id}
                    onCheckedChange={() => setSelectedType(selectedType === type.id ? "" : type.id)}
                  />
                  <Label
                    htmlFor={`type-${type.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="significance">
          <AccordionTrigger>Significance</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {significance.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`significance-${item.id}`}
                    checked={selectedSignificance === item.id}
                    onCheckedChange={() => setSelectedSignificance(selectedSignificance === item.id ? "" : item.id)}
                  />
                  <Label
                    htmlFor={`significance-${item.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.label}
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

