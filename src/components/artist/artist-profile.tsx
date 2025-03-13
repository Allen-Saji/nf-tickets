"use client";
import Image from "next/image";
import { Particles } from "@/components/magicui/particles";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ExternalLink,
  Instagram,
  Music,
  Share2,
  Twitter,
  Youtube,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ArtistProfile = ({ artistData, eventsData }: any) => {
  const router = useRouter();

  // Format date helper function
  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  // Get upcoming events (sorted by date)
  const upcomingEvents = eventsData
    .filter((event: any) => new Date(event.eventDate) > new Date())
    .sort(
      (a: any, b: any) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )
    .slice(0, 3);

  // Get past events
  const pastEvents = eventsData
    .filter((event: any) => new Date(event.eventDate) <= new Date())
    .sort(
      (a: any, b: any) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    )
    .slice(0, 3);

  return (
    <main className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-grow flex flex-col z-10">
        {/* Hero section with artist image */}
        <div className="w-full h-[50vh] relative">
          <Image
            src={
              artistData.backgroundImageUrl ||
              "/artist-background-placeholder.jpg"
            }
            alt={`${artistData.artistName} background`}
            fill
            className="object-contain"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

          <div className="absolute bottom-0 left-0 w-full p-6 flex items-end">
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-[#DEFF58] overflow-hidden mr-6">
              <Image
                src={artistData.profilePictureUrl || "/default-profile.jpg"}
                alt={artistData.artistName}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <span className="text-[#DEFF58] font-medium mb-2">
                {artistData.genre}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {artistData.artistName}
              </h1>

              <div className="flex space-x-4 text-gray-300">
                {artistData.socialLinks?.twitter && (
                  <Link href={artistData.socialLinks.twitter} target="_blank">
                    <Twitter className="w-5 h-5 text-[#DEFF58] hover:text-white transition-colors" />
                  </Link>
                )}
                {artistData.socialLinks?.instagram && (
                  <Link href={artistData.socialLinks.instagram} target="_blank">
                    <Instagram className="w-5 h-5 text-[#DEFF58] hover:text-white transition-colors" />
                  </Link>
                )}
                {artistData.socialLinks?.youtube && (
                  <Link href={artistData.socialLinks.youtube} target="_blank">
                    <Youtube className="w-5 h-5 text-[#DEFF58] hover:text-white transition-colors" />
                  </Link>
                )}
              </div>
            </div>

            <Button className="bg-[#DEFF58] text-black font-semibold hover:bg-[#f0ff85] transition-all duration-300 hover:scale-105">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Artist content */}
        <div className="w-full max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Artist bio and details */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About Artist</h2>
            <p className="text-gray-300 mb-8">
              {artistData.bio || "No bio available."}
            </p>

            {/* Stats section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="p-4 border border-gray-800 rounded-xl bg-black/50 backdrop-blur-sm text-center">
                <p className="text-[#DEFF58] text-xl font-bold">
                  {eventsData.length}
                </p>
                <p className="text-gray-400">Total Events</p>
              </div>
              <div className="p-4 border border-gray-800 rounded-xl bg-black/50 backdrop-blur-sm text-center">
                <p className="text-[#DEFF58] text-xl font-bold">
                  {upcomingEvents.length}
                </p>
                <p className="text-gray-400">Upcoming</p>
              </div>
              <div className="p-4 border border-gray-800 rounded-xl bg-black/50 backdrop-blur-sm text-center">
                <p className="text-[#DEFF58] text-xl font-bold">
                  {pastEvents.length}
                </p>
                <p className="text-gray-400">Past Events</p>
              </div>
              <div className="p-4 border border-gray-800 rounded-xl bg-black/50 backdrop-blur-sm text-center">
                <p className="text-[#DEFF58] text-xl font-bold">
                  {artistData.followers || 0}
                </p>
                <p className="text-gray-400">Followers</p>
              </div>
            </div>

            {/* Upcoming events section */}
            {upcomingEvents.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                <div className="space-y-4 mb-12">
                  {upcomingEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className="p-4 border border-gray-800 rounded-xl bg-black/50 backdrop-blur-sm flex items-center gap-4 hover:border-[#DEFF58] transition-colors cursor-pointer"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={event.imageUrl || "/event-placeholder.jpg"}
                          alt={event.eventName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{event.eventName}</h3>
                        <div className="flex text-sm text-gray-400 gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#DEFF58]" />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Music className="w-3 h-3 text-[#DEFF58]" />
                            <span>{event.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{event.ticketPrice} SOL</p>
                        <p className="text-xs text-gray-400">
                          {event.ticketsRemaining} tickets left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Past events section */}
            {pastEvents.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {pastEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className="p-4 border border-gray-800 rounded-xl bg-black/50 backdrop-blur-sm hover:border-[#DEFF58] transition-colors cursor-pointer"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={event.imageUrl || "/event-placeholder.jpg"}
                          alt={event.eventName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-semibold truncate">
                        {event.eventName}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {formatDate(event.eventDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar - recent videos, more links */}
          <div className="md:col-span-1">
            <div className="sticky top-6 space-y-8">
              {/* Featured video if available */}
              {artistData.featuredVideoUrl && (
                <div className="p-6 border border-gray-800 rounded-xl bg-black/60 backdrop-blur-sm">
                  <h2 className="text-xl font-bold mb-4">Featured Video</h2>
                  <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden mb-2">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={artistData.featuredVideoUrl}
                      title="Featured video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-sm text-gray-400">
                    {artistData.featuredVideoTitle || "Latest performance"}
                  </p>
                </div>
              )}

              {/* Connect section */}
              <div className="p-6 border border-gray-800 rounded-xl bg-black/60 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4">Connect</h2>
                <div className="space-y-3">
                  {artistData.externalUrl && (
                    <Link
                      href={artistData.externalUrl}
                      target="_blank"
                      className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:border-[#DEFF58] transition-colors"
                    >
                      <span>Official Website</span>
                      <ExternalLink className="w-4 h-4 text-[#DEFF58]" />
                    </Link>
                  )}

                  <Button className="w-full bg-[#DEFF58] text-black font-semibold rounded-full py-6 gap-2 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-105 mt-4">
                    Follow Artist
                  </Button>
                </div>
              </div>

              {/* More info or related artists */}
              <div className="p-6 border border-gray-800 rounded-xl bg-black/60 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4">Artist Info</h2>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <strong>Genre:</strong> {artistData.genre}
                  </p>
                  <p>
                    <strong>Total Events:</strong> {eventsData.length}
                  </p>
                  <p>
                    <strong>Member Since:</strong>{" "}
                    {new Date(artistData.createdAt).getFullYear()}
                  </p>
                  <p className="text-sm text-gray-400 mt-4">
                    All tickets are minted as NFTs on the Solana blockchain,
                    ensuring authenticity and ownership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal line */}
      <div className="w-full max-w-6xl mx-auto border-t border-gray-800 my-6 z-10"></div>

      {/* Footer section */}
      <div className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold">
            <span className="text-[#DEFF58]">15</span> - Digital Event Ticketing
          </h2>
          <p className="text-gray-400 text-sm">Powered by Solana</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            Terms
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            Privacy
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            Help
          </Button>
        </div>
      </div>

      <Particles
        className="absolute inset-0 z-0"
        quantity={300}
        ease={100}
        color={"#DEFF58"}
        refresh
      />
    </main>
  );
};

export default ArtistProfile;
