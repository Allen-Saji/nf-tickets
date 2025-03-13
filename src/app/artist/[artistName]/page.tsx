import { Suspense } from "react";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DynamicArtistProfile = dynamic(
  () => import("@/components/artist/artist-profile"),
  { ssr: false }
);

interface Params {
  params: {
    artistName: string;
  };
}

export default async function ArtistPage({ params }: Params) {
  const { artistName } = params;

  try {
    const artistData = await api.artist.getByName({
      artistName: decodeURIComponent(artistName),
    });

    if (!artistData) {
      return notFound();
    }

    const eventsData = await api.event.searchByArtist({
      query: artistData.artistName,
    });

    const artistWithSocialLinks = {
      ...artistData,
      socialLinks: {
        twitter:
          "https://twitter.com/" + artistData.artistName.replace(/\s/g, ""),
        instagram:
          "https://instagram.com/" + artistData.artistName.replace(/\s/g, ""),
        youtube:
          "https://youtube.com/@" + artistData.artistName.replace(/\s/g, ""),
      },
      followers: Math.floor(Math.random() * 5000) + 1000,
      externalUrl:
        "https://" +
        artistData.artistName.replace(/\s/g, "").toLowerCase() +
        ".com",
      featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      featuredVideoTitle: "Latest Performance Highlights",
    };

    return (
      <div className="w-full">
        <div className="relative" style={{ minHeight: "600px" }}>
          <Suspense
            fallback={
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Skeleton className="h-48 w-full rounded-lg mb-4" />
                <Skeleton className="h-24 w-3/4 rounded-lg mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
              </div>
            }
          >
            <DynamicArtistProfile
              artistData={artistWithSocialLinks}
              eventsData={eventsData}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
