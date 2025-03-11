import EventCarousel from "@/components/event/event-carousel";
import { api } from "@/trpc/server";
import CategoriesGrid from "@/components/event/category-cards";
import EventCardDeck from "@/components/event/card-deck";

export default async function Events() {
  const eventsData = await api.event.getAll({
    take: 20,
  });

  const { events } = eventsData;

  const musicEvents = events.filter((event) => event.category === "Music");
  const uniqueMusicArtistEvents = filterUniqueArtistEvents(musicEvents, 4);

  return (
    <div className="flex flex-col items-center justify-center">
      <EventCarousel events={uniqueMusicArtistEvents} />
      <CategoriesGrid />
      <EventCardDeck events={uniqueMusicArtistEvents} />
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
    const artistId = event.artist.id;

    if (!uniqueArtistIds.has(artistId)) {
      uniqueArtistIds.add(artistId);
      filteredEvents.push(event);

      if (filteredEvents.length >= count) {
        break;
      }
    }
  }

  return filteredEvents;
}
