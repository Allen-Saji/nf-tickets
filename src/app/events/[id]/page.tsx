import { Suspense } from "react";
import { api } from "@/trpc/server";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DynamicEventDetails = dynamic(
  () => import("@/components/event/event-details"),
  { ssr: false }
);

const Page = async ({ params }: { params: { id: string } }) => {
  const eventId = Number(params.id);
  const eventData = await api.event.getById({ id: eventId });
  const artistId = eventData.artistId;
  const artistData = await api.artist.getById({ id: artistId });

  return (
    <div className="w-full">
      <div className="relative" style={{ minHeight: "600px" }}>
        <Suspense
          fallback={
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Skeleton className="h-64 w-full rounded-lg mb-4" />
              <Skeleton className="h-32 w-3/4 rounded-lg mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            </div>
          }
        >
          <DynamicEventDetails eventData={eventData} artistData={artistData} />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
