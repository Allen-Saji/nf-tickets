import { Suspense } from "react";
import { api } from "@/trpc/server";
import EventCarousel from "@/components/event/event-carousel";
import CategoriesGrid from "@/components/event/category-cards";
import EventCardDeck from "@/components/event/card-deck";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryEventCardsClient = dynamic(
  () => import("@/components/event/category-event-cards"),
  { ssr: false }
);

export default async function Events({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category;
  const eventsData = await api.event.getAll({ take: 20 });
  const { events } = eventsData;
  const filteredEvents = category
    ? events.filter(
        (event) => event.category.toLowerCase() === category.toLowerCase()
      )
    : events;
  const musicEvents = events.filter((event) => event.category === "Music");
  const uniqueMusicArtistEvents = filterUniqueArtistEvents(musicEvents, 4);

  return (
    <div className="flex flex-col items-center justify-center">
      {!category && <EventCarousel events={events} />}

      {category && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-4">
            {category.charAt(0).toUpperCase() + category.slice(1)} Events
          </h2>
        </div>
      )}

      {!category && <CategoriesGrid />}

      {category && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="relative py-12" style={{ minHeight: "500px" }}>
            <Suspense
              fallback={
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-48 w-full rounded-lg"
                    ></Skeleton>
                  ))}
                </div>
              }
            >
              <CategoryEventCardsClient events={filteredEvents} />
            </Suspense>
          </div>
        </div>
      )}

      {!category && <EventCardDeck events={uniqueMusicArtistEvents} />}

      {category && (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 flex justify-center">
          <a
            href="/events"
            className="inline-flex items-center justify-between bg-white text-black font-medium px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
          >
            <span>View All Categories</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

function filterUniqueArtistEvents(events: any[], count: number) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );

  const uniqueArtistIds = new Set();
  const filteredEvents = [];

  for (const event of sortedEvents) {
    const artistId = event.artist?.id;
    if (artistId && !uniqueArtistIds.has(artistId)) {
      uniqueArtistIds.add(artistId);
      filteredEvents.push(event);
      if (filteredEvents.length >= count) {
        break;
      }
    }
  }

  return filteredEvents;
}
