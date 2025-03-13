import { api } from "@/trpc/server";
import ArtistProfile from "@/components/artist/artist-profile";
import { notFound } from "next/navigation";

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
      <ArtistProfile
        artistData={artistWithSocialLinks}
        eventsData={eventsData}
      />
    );
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return notFound();
  }
}
