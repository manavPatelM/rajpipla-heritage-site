import { getArtifacts } from "@/lib/db-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ArtifactFilters from "./components/artifact-filters"

export default async function ArtifactsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const era = typeof searchParams.era === "string" ? searchParams.era : undefined
  const type = typeof searchParams.type === "string" ? searchParams.type : undefined
  const significance = typeof searchParams.significance === "string" ? searchParams.significance : undefined
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined

  const { artifacts, pagination } = await getArtifacts({ era, type, significance, search }, page, 12)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Digital Artifact Repository</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ArtifactFilters />
        </div>

        <div className="lg:col-span-3">
          {search && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing results for: <span className="font-medium text-foreground">"{search}"</span>
              </p>
            </div>
          )}

          {artifacts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No artifacts found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
              <Button asChild variant="outline">
                <Link href="/artifacts">Clear all filters</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artifacts.map((artifact) => (
                <Card key={artifact._id as string} className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={artifact.imageUrl || "/placeholder.svg?height=300&width=400"}
                      alt={artifact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold mb-1">{artifact.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {artifact.era} • {artifact.type}
                    </p>
                    <p className="text-sm line-clamp-3 mb-4">{artifact.description}</p>
                    <Button asChild size="sm">
                      <Link href={`/artifacts/${artifact._id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={{
                      pathname: "/artifacts",
                      query: {
                        ...searchParams,
                        page: pageNum,
                      },
                    }}
                  >
                    <Button variant={pageNum === page ? "default" : "outline"} size="sm" className="w-10">
                      {pageNum}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

