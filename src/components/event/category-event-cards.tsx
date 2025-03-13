"use client";
import React, { useState } from "react";
import { EventCard } from "@/components/event/card-deck";

export default function CategoryEventCardsClient({
  events,
}: {
  events: any[];
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="relative" style={{ height: "420px", minWidth: "1000px" }}>
      {events.map((event, index) => (
        <EventCard
          key={event.id}
          event={event}
          index={index}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      ))}
    </div>
  );
}
