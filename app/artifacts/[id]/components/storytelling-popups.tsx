"use client"
import type { Artifact } from "@/lib/models"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function StorytellingPopups({
  storyPoints,
}: {
  storyPoints: Artifact["storyPoints"]
}) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Historical Facts</h3>
      <Accordion type="single" collapsible className="w-full">
        {storyPoints.map((point, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{point.title}</AccordionTrigger>
            <AccordionContent>
              <p>{point.description}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

