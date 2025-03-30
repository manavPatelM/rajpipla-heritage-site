import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { getArtifacts } from "@/lib/db-service"
import ArtifactsTable from "./components/artifacts-table"
import { Artifact } from "@/lib/models"

export default async function AdminArtifactsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const { artifacts, pagination } = await getArtifacts({}, page, 10)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Artifacts</h1>
        <Button asChild>
          <Link href="/admin/artifacts/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Artifact
          </Link>
        </Button>
      </div>

      <ArtifactsTable artifacts={artifacts as Artifact[]} pagination={pagination} />
    </div>
  )
}

