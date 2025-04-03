import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import ArtifactsTable from "./components/artifacts-table"
import { Artifact } from "@/lib/models"
import api from "@/lib/axios"

export default async function AdminArtifactsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const serchParamsVal = await searchParams
  const page = typeof serchParamsVal.page === "string" ? Number.parseInt(serchParamsVal.page) : 1
  const response = await api.get("api/artifacts", {
    params: {
      page,
      limit: 10,
    },
  })

  const artifacts = response.data.data
  const pagination = response.data.pagination
  
  // console.log("artifacts", response.data);
  

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

