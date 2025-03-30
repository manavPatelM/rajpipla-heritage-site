import { getArtifactById } from "@/lib/db-service"
import { notFound } from "next/navigation"
import ArtifactForm from "../components/artifact-form"
import { Artifact } from "@/lib/models"

export default async function EditArtifactPage({
  params,
}: {
  params: { id: string }
}) {
  const artifact = await getArtifactById(params.id)

  if (!artifact) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Artifact</h1>
      <ArtifactForm artifact={artifact as Artifact} />
    </div>
  )
}

