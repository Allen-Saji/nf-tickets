"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Event {
  id: number;
  artistId: number;
  eventName: string;
  eventDate: Date;
  venue: string;
  city: string;
  category: string;
  capacity: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string | null;
  artistWallet: string;
  isTicketTransferable: boolean;
  managerPDA: string;
  eventPublicKey: string;
  artist: {
    id: number;
    userId: string;
    artistName: string;
    bio: string | null;
    genre: string;
    profilePictureUrl: string | null;
    backgroundImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      name?: string | null;
      image?: string | null;
    };
  };
}

interface EventCarouselProps {
  events: Event[];
  autoplayInterval?: number;
}

export default function EventCarousel({
  events = [],
  autoplayInterval = 3000,
}: EventCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setPreviousIndex(currentIndex);
    setDirection("next");
    setCurrentIndex((prevIndex) =>
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );

    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 500);
  }, [events.length, isTransitioning, currentIndex]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setPreviousIndex(currentIndex);
    setDirection("prev");
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );

    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 500);
  }, [events.length, isTransitioning, currentIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;

      setIsTransitioning(true);
      setPreviousIndex(currentIndex);
      setDirection(index > currentIndex ? "next" : "prev");
      setCurrentIndex(index);

      // Reset transition state after animation completes
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [currentIndex, isTransitioning]
  );

  // Autoplay functionality
  useEffect(() => {
    if (events.length <= 1) return; // Don't autoplay if there's only one event

    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [nextSlide, autoplayInterval, events.length, isTransitioning]);

  if (events.length === 0) {
    return (
      <div className="w-full mx-auto h-48 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
        No events available
      </div>
    );
  }

  // Ensure we're getting the current event correctly
  const currentEvent = events[currentIndex];
  const previousEvent = events[previousIndex];

  // Get the first initial for avatar fallback
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "A";
  };

  return (
    <div className="relative w-4/5 mx-auto h-96 bg-black text-white overflow-hidden rounded-lg">
      {/* Previous slide (sliding out) */}
      {isTransitioning && (
        <div
          className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out ${
            direction === "next" ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          <Image
            src={previousEvent.imageUrl || "/images/default-event.jpg"}
            alt={previousEvent.eventName}
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Current slide (sliding in) */}
      <div
        className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out ${
          isTransitioning
            ? direction === "next"
              ? "translate-x-0 transform-gpu"
              : "translate-x-0 transform-gpu"
            : "translate-x-0"
        } ${
          isTransitioning
            ? direction === "next"
              ? "animate-slide-from-right"
              : "animate-slide-from-left"
            : ""
        }`}
        style={{
          transform: isTransitioning
            ? `translateX(${direction === "next" ? "0%" : "0%"})`
            : "translateX(0%)",
          animation: isTransitioning
            ? `${
                direction === "next" ? "slideFromRight" : "slideFromLeft"
              } 500ms ease-in-out forwards`
            : "none",
        }}
      >
        <Image
          src={currentEvent.imageUrl || "/images/default-event.jpg"}
          alt={currentEvent.eventName}
          fill
          className="object-contain"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Content Area */}
        <div
          className={`absolute bottom-12 left-6 z-10 max-w-md transition-opacity duration-300 ease-in-out ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <h2 className="text-4xl font-bold mb-2 text-[#DEFF58]">
            {currentEvent.eventName}
          </h2>

          <p className="text-lg font-semibold mb-3 line-clamp-2">
            {currentEvent.description ||
              `Join us for an amazing event on ${new Date(
                currentEvent.eventDate
              ).toLocaleDateString()}`}
          </p>

          <div className="flex items-center gap-3">
            <Link
              href={`/events/${currentEvent.id}`}
              className="bg-[#DEFF58] text-black px-3 py-1.5 font-medium text-sm rounded hover:bg-[#DEFF58]/80 hover:scale-105 transition"
            >
              Book Tickets
            </Link>

            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarImage
                src={
                  currentEvent.artist.profilePictureUrl ||
                  "/images/default-artist.jpg"
                }
                alt={currentEvent.artist.artistName}
              />
              <AvatarFallback>
                {getInitials(currentEvent.artist.artistName)}
              </AvatarFallback>
            </Avatar>

            <span className="text-sm font-medium">
              {currentEvent.artist.artistName}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation arrows - Repositioned to not interfere with content */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full flex items-center justify-start text-white text-4xl font-light opacity-70 hover:opacity-100 transition-opacity hover:bg-black/20"
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        <div className="pl-2">‹</div>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full flex items-center justify-end text-white text-4xl font-light opacity-70 hover:opacity-100 transition-opacity hover:bg-black/20"
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        <div className="pr-2">›</div>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-4" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isTransitioning}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes slideFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideFromLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-from-right {
          animation: slideFromRight 500ms ease-in-out forwards;
        }

        .animate-slide-from-left {
          animation: slideFromLeft 500ms ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
