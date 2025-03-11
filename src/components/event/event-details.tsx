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
import { useState, useEffect } from "react";
import { useProgram } from "@/app/lib/solana/hooks/use-program";
import { mintTicket } from "@/app/lib/solana/instructions/ticket";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { TicketArgs } from "@/types/types";
import dynamic from "next/dynamic";
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import Link from "next/link";

interface TicketType {
  id: number;
  eventId: number;
  ticketAddress: string;
  ownerWallet: string;
  txnSignature: string;
}

const EventDetails = ({ eventData, artistData }: any) => {
  const router = useRouter();
  const [showNFT, setShowNFT] = useState(false);
  const { program, provider } = useProgram();
  const { connected, publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketType | null>();

  const createTicket = api.ticket.createTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket Booked", {
        description: "Successfully booked ticket",
        duration: 5000,
        className: "bg-[#1a1d2d] border-green-500 text-white",
      });
      setShowNFT(true);
    },

    onError: (error) => {
      toast.error("Error Booking Ticket", {
        description: error.message || "Failed to book ticket",
        duration: 5000,
      });
    },
  });

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const handleBookTicket = async () => {
    if (!program || !provider || !connected) {
      toast.error("Wallet Connection Error", {
        description: "Please connect your wallet to book a ticket.",
        duration: 5000,
      });
      return;
    }
    try {
      // Show loading state
      setIsLoading(true);

      // 1. Mint the ticket on Solana blockchain
      const ticketArgs: TicketArgs = {
        name: eventData.eventName,
        uri: eventData.imageUrl,
        price: eventData.ticketPrice,
        venueAuthority: eventData.venueAuthority,
      };

      const artistAddress = eventData.artistWallet;
      const mintResult = await mintTicket(
        artistAddress,
        eventData.eventPublicKey,
        ticketArgs,
        program,
        provider
      );

      // Check for success flag and required properties
      if (
        mintResult.success &&
        mintResult.ticketPublicKey &&
        mintResult.signature
      ) {
        // Transaction was successful and we have all required properties
        const ticketPublicKey = mintResult.ticketPublicKey.toString();
        const signature = mintResult.signature;

        // Update your database
        createTicket.mutate(
          {
            ticketAddress: ticketPublicKey,
            ownerWallet: provider.wallet.publicKey.toString(),
            txnSignature: signature,
            eventId: eventData.id,
          },
          {
            onSuccess: (data) => {
              setTicketData(data);
              // Show success toast
              toast.success("Ticket booked successfully!", {
                description: `Your ticket has been minted. Ticket address: ${ticketPublicKey.slice(
                  0,
                  8
                )}...`,
                duration: 5000,
              });
            },
            onError: (error) => {
              console.error("Database update error:", error);
              // Show partial success notification
              toast.warning("Ticket minted, but database update failed", {
                description:
                  "Your ticket was created on-chain, but we couldn't update our records. Please contact support with this signature: " +
                  signature,
                duration: 10000,
              });
            },
          }
        );
      } else {
        // Either transaction failed or we're missing required properties
        throw new Error(
          mintResult.error?.message ||
            "Failed to mint ticket - missing ticket information"
        );
      }
    } catch (error) {
      console.error("Error booking ticket:", error);
      // Show error notification
      toast.error("Error booking ticket", {
        description:
          error instanceof Error ? error.message : "Failed to book ticket",
        duration: 5000,
        action: {
          label: "Try Again",
          onClick: () => handleBookTicket(),
        },
      });
    } finally {
      setIsLoading(false);
    }
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
                <div className="absolute z-10 inset-0 p-4 flex flex-col justify-between">
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
                      <span className="text-xs font-bold">
                        # {eventData.capacity - eventData.ticketsRemaining + 1}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>{formatDate(eventData.eventDate)}</p>
                    <p>
                      {eventData.venue}, {eventData.city}
                    </p>
                  </div>
                </div>
                <div className="absolute z-0 inset-0 flex items-center justify-center">
                  <Image
                    src={eventData.imageUrl || "/default-ticket.jpg"}
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
                    <span className="text-2xl font-bold">
                      {eventData.ticketPrice} SOL
                    </span>
                  </div>

                  {/* Book Your Show button - only active when wallet is connected */}
                  <Button
                    className="w-full bg-[#DEFF58] text-black font-semibold rounded-full py-6 gap-2 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-105 mb-4"
                    onClick={handleBookTicket}
                    disabled={!connected || isLoading}
                  >
                    {isLoading ? "Processing..." : "Book Your Show"}
                    <Ticket className="w-5 h-5" />
                  </Button>

                  {/* Wallet connect button using the Solana wallet adapter */}
                  <div className="wallet-adapter-wrapper mt-3 flex justify-center">
                    <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger" />
                  </div>

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
                  <Link
                    target="_blank"
                    href={`https://explorer.solana.com/tx/${ticketData?.txnSignature}?cluster=devnet`}
                  >
                    <Button className="flex-1 bg-[#DEFF58] text-black font-semibold hover:bg-[#f0ff85]">
                      View on Solana
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
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
