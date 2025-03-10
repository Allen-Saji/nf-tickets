// app/events/page.tsx
import EventCarousel from "@/components/event/event-carousel";
import { api } from "@/trpc/server";
import CategoriesGrid from "@/components/event/category-cards";
import EventCardDeck from "@/components/event/card-deck";

export default async function Events() {
  // Fetch events using the server-side API client
  const eventsData = await api.event.getAll({
    // You can add optional filters here
    take: 10, // Limit to 10 events
  });

  // Extract events from the response
  const { events } = eventsData;
  console.log("events: ", events);

  return (
    <div className="flex flex-col items-center justify-center">
      <EventCarousel events={events} />
      <CategoriesGrid />
      <EventCardDeck />
    </div>
  );
}
