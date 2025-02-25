"use client";
import React, { useEffect, useRef } from "react";
import { Wifi, Battery } from "lucide-react";

const Phone = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollDown = true;
    const interval = setInterval(() => {
      if (scrollContainer) {
        if (scrollDown) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth",
          });
        } else {
          scrollContainer.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
        scrollDown = !scrollDown;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="md:w-1/2 flex justify-center">
      <div className="relative w-[280px] h-[560px]">
        <div className="absolute inset-0 bg-gray-800 rounded-[40px] shadow-lg"></div>
        <div className="absolute inset-[6px] bg-black rounded-[36px] overflow-hidden">
          <div className="h-[40px] bg-black flex justify-between items-center px-6 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[24px] bg-black rounded-b-[16px]"></div>
            <span className="text-white text-sm font-medium">9:41</span>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white" />
              <Battery className="w-5 h-5 text-white" />
            </div>
          </div>
          <div
            ref={scrollRef}
            className="px-4 py-3 h-[calc(100%-40px)] overflow-y-auto bg-black"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <div className="mb-4">
              <h3 className="text-[#DEFF58] text-lg font-bold">Live Events</h3>
              <p className="text-gray-400 text-xs">
                Upcoming shows just for you
              </p>
            </div>
            <div className="space-y-3">
              {/* F1 Racing */}
              <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-[#DEFF58] rounded-md flex items-center justify-center mr-2">
                    <span className="text-black text-xs font-bold">F1</span>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">
                      Formula 1
                    </h4>
                    <p className="text-gray-400 text-xs">Today, 3:00 PM</p>
                  </div>
                </div>
                <p className="text-white text-sm">
                  Monaco Grand Prix - Starts in 2 hours! Tap to watch live.
                </p>
                <div className="mt-2 bg-[#DEFF58] text-black text-xs font-semibold py-1 px-2 rounded-full w-fit">
                  LIVE SOON
                </div>
              </div>

              {/* Ted Talk */}
              <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-[#DEFF58] rounded-md flex items-center justify-center mr-2">
                    <span className="text-black text-xs font-bold">TED</span>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">
                      TED Talk
                    </h4>
                    <p className="text-gray-400 text-xs">Tomorrow, 7:00 PM</p>
                  </div>
                </div>
                <p className="text-white text-sm">
                  Elon Musk: "The Future of AI" - Limited seats available!
                </p>
                <div className="mt-2 bg-gray-700 text-white text-xs font-semibold py-1 px-2 rounded-full w-fit">
                  BOOK NOW
                </div>
              </div>

              {/* Comedy Show */}
              <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-[#DEFF58] rounded-md flex items-center justify-center mr-2">
                    <span className="text-black text-xs font-bold">MR</span>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">
                      Matt Rife
                    </h4>
                    <p className="text-gray-400 text-xs">Friday, 8:30 PM</p>
                  </div>
                </div>
                <p className="text-white text-sm">
                  ProbleMATTic World Tour - Madison Square Garden
                </p>
                <div className="mt-2 flex space-x-2">
                  <div className="bg-gray-700 text-white text-xs font-semibold py-1 px-2 rounded-full">
                    SELLING FAST
                  </div>
                  <div className="bg-[#DEFF58] text-black text-xs font-semibold py-1 px-2 rounded-full">
                    GET TICKETS
                  </div>
                </div>
              </div>

              {/* Movie Premiere */}
              <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-[#DEFF58] rounded-md flex items-center justify-center mr-2">
                    <span className="text-black text-xs font-bold">AV</span>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">
                      Avengers
                    </h4>
                    <p className="text-gray-400 text-xs">Next Week</p>
                  </div>
                </div>
                <p className="text-white text-sm">
                  Exclusive Premiere Screening - "Avengers: Secret Wars"
                </p>
                <div className="mt-2 bg-gray-700 text-white text-xs font-semibold py-1 px-2 rounded-full w-fit">
                  PRE-ORDER
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-[-2px] top-[120px] w-[3px] h-[32px] bg-gray-700 rounded-l-sm"></div>
        <div className="absolute left-[-2px] top-[100px] w-[3px] h-[24px] bg-gray-700 rounded-r-sm"></div>
        <div className="absolute left-[-2px] top-[130px] w-[3px] h-[24px] bg-gray-700 rounded-r-sm"></div>
      </div>
    </div>
  );
};

export default Phone;
