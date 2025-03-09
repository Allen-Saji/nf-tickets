"use client";
import React, { useState } from "react";
const EventCard = ({
  title,
  subtitle,
  color,
  index,
  activeIndex,
  setActiveIndex,
}: any) => {
  const isActive = activeIndex === index;
  const cardWidth = 340;
  const visibleWidth = index === 0 ? cardWidth : cardWidth * 0.8; // 60% visible initially for non-first cards

  // Calculate position based on index and active state
  const leftPosition =
    index === 0
      ? 0
      : activeIndex === null
      ? `${index * visibleWidth}px`
      : isActive
      ? `${index * visibleWidth}px`
      : activeIndex < index
      ? `${index * visibleWidth + 40}px`
      : `${index * visibleWidth - 40}px`;

  // Dynamic z-index ensures active card is on top
  const zIndex = isActive ? 50 : 10 - index;

  return (
    <div
      className="absolute top-0 transition-all duration-300 rounded-xl overflow-hidden"
      style={{
        left: leftPosition,
        height: "420px",
        width: `${cardWidth}px`,
        zIndex: zIndex,
        backgroundColor: color,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setActiveIndex(index)}
      onMouseLeave={() => setActiveIndex(null)}
    >
      {/* First card special header */}
      {index === 0 && (
        <div className="bg-white p-4">
          <p className="text-sm uppercase text-center">THIS IS</p>
          <h2 className="text-3xl font-bold text-center">Chainsmokers</h2>
        </div>
      )}

      {/* Card content */}
      <div className="absolute left-4 bottom-4 text-white z-20">
        <h3 className="text-5xl font-bold mb-1">{title}</h3>
        <p
          className={`text-lg transition-opacity duration-300 ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};

const EventCardDeck = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const tourData = [
    { id: 1, title: "Closer", subtitle: "Asia Tour", color: "#333333" },
    { id: 2, title: "Levitator", subtitle: "London Tour", color: "#8A2BE2" }, // Purple
    { id: 3, title: "Blinding", subtitle: "NA Tour", color: "#1E90FF" }, // Blue
    { id: 4, title: "Bad Guy", subtitle: "World Tour", color: "#FF6347" }, // Red-Orange
  ];

  return (
    <div className="bg-black min-h-screen p-8 w-4/5">
      <h1 className="text-5xl font-bold text-white mb-12">
        Popular Music Tours
      </h1>

      <div
        className="relative"
        style={{ height: "420px", width: "100%", minWidth: "1000px" }}
      >
        {tourData.map((tour, index) => (
          <EventCard
            key={tour.id}
            title={tour.title}
            subtitle={tour.subtitle}
            color={tour.color}
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
