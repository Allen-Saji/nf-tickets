"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const EventCard = ({ event, index, activeIndex, setActiveIndex }: any) => {
  const router = useRouter();
  const isActive = activeIndex === index;
  const cardWidth = 340;
  const cardGap = 30;
  const visibleWidth = index === 0 ? cardWidth : cardWidth * 0.7;
  const leftPosition =
    index === 0
      ? 0
      : activeIndex === null
      ? `${index * visibleWidth + index * cardGap}px`
      : isActive
      ? `${index * visibleWidth + index * cardGap}px`
      : activeIndex < index
      ? `${index * visibleWidth + index * cardGap + 40}px`
      : `${index * visibleWidth + index * cardGap - 40}px`;

  const zIndex = isActive ? 50 : 10 - index;
  const handleCardClick = () => {
    router.push(`/events/${event.id}`);
  };

  return (
    <div
      className="absolute top-0 transition-all duration-500 rounded-xl overflow-hidden cursor-pointer"
      style={{
        left: leftPosition,
        height: "420px",
        width: `${cardWidth}px`,
        zIndex: zIndex,
        transition: "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)",
        transform: isActive ? "translateY(-10px)" : "translateY(0)",
        boxShadow: isActive
          ? `0 10px 25px rgba(222, 255, 88, 0.5), 0 0 0 2px #DEFF58, 0 0 0 4px rgba(0, 0, 0, 0.8)`
          : `0 5px 15px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(50, 50, 50, 0.5)`,
        border: isActive
          ? "2px solid #DEFF58"
          : "2px solid rgba(80, 80, 80, 0.4)",
      }}
      onMouseEnter={() => setActiveIndex(index)}
      onMouseLeave={() => setActiveIndex(null)}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={event.imageUrl}
          alt={event.eventName}
          fill
          style={{
            objectFit: "cover",
            transform: isActive ? "scale(1.05)" : "scale(1)",
          }}
          className="transition-transform duration-700 ease-in-out"
        />
        {/* Dark gradient overlay for better text readability and card edges */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)",
            opacity: isActive ? 0.9 : 0.7,
          }}
        ></div>
        {/* Add a subtle border glow to increase visibility between cards */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            boxShadow: `inset 0 0 15px rgba(255, 255, 255, 0.1), 0 0 5px rgba(255, 255, 255, 0.05)`,
            opacity: isActive ? 0.8 : 0.4,
          }}
        ></div>
      </div>
      {/* THIS IS text */}
      <div
        className={`absolute top-6 left-0 right-0 text-center transition-opacity duration-300 ease-in-out ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-sm uppercase tracking-widest text-white font-light mb-1">
          THIS IS
        </p>
        <h2 className="text-3xl font-bold text-white px-4">
          {event.artist.artistName}
        </h2>
      </div>
      {/* Event name - now centered */}
      <div
        className={`absolute left-0 right-0 bottom-8 px-6 text-white z-20 text-center transition-all duration-500 ease-in-out ${
          isActive ? "opacity-100 transform-none" : "opacity-80 translate-y-4"
        }`}
      >
        <h3 className="text-4xl font-bold leading-tight">{event.eventName}</h3>
      </div>
    </div>
  );
};

const EventCardDeck = ({ events }: any) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const displayEvents = events || [];

  return (
    <div className="bg-black min-h-screen p-8 w-4/5">
      <h1 className="text-5xl font-bold text-white mb-12">Popular Tours</h1>
      <div
        className="relative"
        style={{ height: "420px", width: "100%", minWidth: "1000px" }}
      >
        {displayEvents.map((event: any, index: number) => (
          <EventCard
            key={event.id}
            event={event}
            index={index}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCardDeck;
