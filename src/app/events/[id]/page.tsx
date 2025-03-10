import EventDetails from "@/components/event/event-details";
import { api } from "@/trpc/server";

const Page = async ({ params }: { params: { id: string } }) => {
  const eventId = Number((await params).id);
  const eventData = await api.event.getById({ id: eventId });
  const artistId = eventData.artistId;
  const artistData = await api.artist.getById({ id: artistId });

  return <EventDetails eventData={eventData} artistData={artistData} />;
};

export default Page;
