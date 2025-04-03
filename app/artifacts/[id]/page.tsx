"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Artifact } from "@/lib/models"
import api from "@/lib/axios" // Axios instance

export default function ArtifactDetailPage() {
  const router = useRouter()
  const { id } = useParams() // Get ID from dynamic route
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return // Prevent fetching if ID is missing

    (async () => {
      try {
        const { data } = await api.get<{ data: Artifact }>(`/api/artifacts/${id}`)
        setArtifact(data.data)
      } catch (error) {
        console.error("Error fetching artifact:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    })()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading artifact details...</p>
      </div>
    )
  }

  if (!artifact) return null

  const handleDownloadPdf = () => {
    if (artifact.pdfGuideUrl) {
      window.open(artifact.pdfGuideUrl, "_blank")
    } else {
      alert("No PDF guide available")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-6">
        <Button variant="ghost" className="mb-6 hover:bg-background hover:text-primary" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Artifacts
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
              <Image
                src={artifact.imageUrl || "/placeholder.svg"}
                alt={artifact.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {artifact.pdfGuideUrl && (
              <Button className="w-full" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Download Guide PDF
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">{artifact.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {artifact.era}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {artifact.type}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {artifact.significance}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{artifact.description}</p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Story Points</h2>
              <div className="space-y-4">
                {artifact.storyPoints?.map((point, index) => (
                  <Card key={index} className="border-border">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg text-primary">{point.title}</h3>
                      <p className="text-muted-foreground mt-1">{point.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
              <p>Added: {new Date(artifact.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(artifact.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};