"use client";
import Image from "next/image";
import { Particles } from "@/components/magicui/particles";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Ticket,
  User,
  Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EventDetails = ({ eventData, artistData }: any) => {
  const router = useRouter();
  const [showNFT, setShowNFT] = useState(false);

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const handleBookTicket = () => {
    // Implement booking functionality
    setShowNFT(true);
  };

  const handleArtistProfile = () => {
    // Navigate to artist profile
    router.push(`/artist/${artistData.id}`);
  };

  return (
    <main className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-grow flex flex-col z-10">
        {/* Event header */}
        <div className="w-full h-[40vh] relative">
          <Image
            src={eventData.imageUrl || "/event-placeholder.jpg"}
            alt={eventData.eventName}
            fill
            className="object-contain"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 w-full p-6 flex flex-col">
            <span className="text-[#DEFF58] font-medium mb-2">
              {eventData.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {eventData.eventName}
            </h1>
            <div className="flex items-center gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#DEFF58]" />
                <span>{formatDate(eventData.eventDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#DEFF58]" />
                <span>
                  {eventData.venue}, {eventData.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Event content */}
        <div className="w-full max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Event details */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About This Event</h2>
            <p className="text-gray-300 mb-8">{eventData.description}</p>

            {/* Artist section */}
            <div className="flex items-center gap-6 mb-8 p-6 border border-gray-800 rounded-xl bg-black/50 backdrop-blur-sm">
              <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={artistData.profilePictureUrl || "/default-profile.jpg"}
                  alt={artistData.artistName}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold">
                  <span className="text-[#DEFF58]">
                    {artistData.artistName}
                  </span>
                </h3>
                <p className="text-gray-300 text-sm mb-2">{artistData.genre}</p>
                <Button
                  variant="outline"
                  className="border-[#DEFF58] text-[#DEFF58] hover:bg-[#DEFF58]/10"
                  onClick={handleArtistProfile}
                >
                  <User className="w-4 h-4 mr-2" />
                  Visit Artist Profile
                </Button>
              </div>
            </div>

            {/* Event details */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Event Details</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>Total Capacity:</strong> {eventData.capacity}{" "}
                  attendees
                </p>
                <p>
                  <strong>Ticket Transfer:</strong>{" "}
                  {eventData.isTicketTransferable ? "Allowed" : "Not allowed"}
                </p>
                <p className="text-sm opacity-60">
                  All tickets are minted as NFTs on the Solana blockchain,
                  ensuring authenticity and ownership.
                </p>
              </div>
            </div>
          </div>

          {/* Ticket/NFT section */}
          <div className="md:col-span-1">
            <div className="sticky top-6 p-6 border border-gray-800 rounded-xl bg-black/60 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">
                {showNFT ? "Your NFT Ticket" : "Get Your NFT Ticket"}
              </h2>

              {/* NFT Ticket Preview - always shown */}
              <div className="relative w-full h-[380px] mb-6 border-2 border-[#DEFF58] rounded-xl overflow-hidden">
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#DEFF58] font-bold">
                        {eventData.category}
                      </p>
                      <h3 className="text-xl font-bold">
                        {eventData.eventName}
                      </h3>
                    </div>
                    <div className="bg-[#DEFF58] text-black rounded-full p-2">
                      <span className="text-xs font-bold">#001</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>{formatDate(eventData.eventDate)}</p>
                    <p>
                      {eventData.venue}, {eventData.city}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={eventData.imageUrl}
                    alt="NFT Ticket QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {!showNFT ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-300">Price</span>
                    <span className="text-2xl font-bold">0.5 SOL</span>
                  </div>
                  <Button
                    className="w-full bg-[#DEFF58] text-black font-semibold rounded-full py-6 gap-2 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-105"
                    onClick={handleBookTicket}
                  >
                    Book Your Show
                    <Ticket className="w-5 h-5" />
                  </Button>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    By purchasing, you agree to our terms of service and NFT
                    ownership guidelines.
                  </p>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#DEFF58] text-[#DEFF58] hover:bg-[#DEFF58]/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button className="flex-1 bg-[#DEFF58] text-black font-semibold">
                    View on Solana
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
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

export default EventDetails;
