"use client"

import { notFound } from "next/navigation"
import ArtifactForm from "../components/artifact-form"
import { Artifact } from "@/lib/models"
import api from "@/lib/axios"
import { useEffect, useState } from "react"

export default function EditArtifactPage({ params }: { params: { id: string } }) {
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const response = await api.get<Artifact>(`/api/artifacts/${params?.id}`)
        console.log("Fetched artifact:", response.data)
        setArtifact(response.data)
      } catch (error) {
        console.error("Error fetching artifact:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchArtifact()
  }, [params.id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !artifact) {
    return notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Artifact</h1>
      <ArtifactForm artifact={artifact} />
    </div>
  )
}
  