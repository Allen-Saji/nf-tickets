"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EventCreator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState("0px");
  const [containerHeight, setContainerHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Measure content height on mount to determine max container height
  useEffect(() => {
    if (contentRef.current) {
      // Temporarily open to measure full height
      const fullHeight = contentRef.current.scrollHeight;
      // Add padding for container
      setContainerHeight(fullHeight + 160); // Account for padding and headers
    }
  }, []);

  // Update height when open/close state changes
  useEffect(() => {
    if (contentRef.current) {
      const newHeight = isOpen ? `${contentRef.current.scrollHeight}px` : "0px";
      setHeight(newHeight);
    }
  }, [isOpen]);

  // Auto-toggle for animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-12">
        <div className="md:w-1/2">
          {/* Fixed height container to prevent page jumping */}
          <div
            style={{
              height: containerHeight > 0 ? `${containerHeight}px` : "auto",
            }}
            className="relative"
          >
            <div
              ref={formContainerRef}
              className="bg-white text-black rounded-lg w-full max-w-md mx-auto overflow-hidden shadow-lg absolute top-0 left-0 right-0"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-4xl font-bold">Create an Event</h2>
                  <button
                    className="p-2 rounded-full border border-red-500 text-black transition-all hover:bg-red-50"
                    onClick={() => setIsOpen((prev) => !prev)}
                  >
                    {isOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <div
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{ height }}
                >
                  <div ref={contentRef} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-2xl">Artist name:</label>
                      <input
                        type="text"
                        className="w-full border-b-2 border-gray-300 py-2 outline-none bg-transparent focus:border-[#DEFF58]"
                        placeholder="Enter artist or event name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-2xl">Event Category:</label>
                      <input
                        type="text"
                        className="w-full border-b-2 border-gray-300 py-2 outline-none bg-transparent focus:border-[#DEFF58]"
                        placeholder="Concert, Festival, Sports, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-2xl">Event Venue:</label>
                      <input
                        type="text"
                        className="w-full border-b-2 border-gray-300 py-2 outline-none bg-transparent focus:border-[#DEFF58]"
                        placeholder="Where is your event located?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-2xl">Ticket Price:</label>
                      <input
                        type="text"
                        className="w-full border-b-2 border-gray-300 py-2 outline-none bg-transparent focus:border-[#DEFF58]"
                        placeholder="Enter base ticket price"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <h3 className="text-3xl font-bold mb-4">
            Become an <span className="text-[#DEFF58]">Event Creator</span>
          </h3>
          <p className="text-gray-300 mb-4">
            Launch your events on the Solana blockchain with just a few clicks.
            Our platform makes it easy to create, sell, and manage NFT tickets
            without any technical knowledge required.
          </p>
          <p className="text-gray-300 mb-8">
            Set your own terms for primary sales and royalties on secondary
            markets, giving you complete control over your event's ticketing
            lifecycle. No more middlemen taking excessive fees from your hard
            work.
          </p>
          <Link href="/events/create">
            <Button className="bg-white hover:bg-gray-200 text-black font-semibold rounded-full py-3 px-6 gap-2 transition-all duration-300 hover:scale-105">
              Create an Event
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCreator;
