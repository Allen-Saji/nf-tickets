"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

const categories = [
  {
    id: "music",
    title: "Hear The Roar",
    image: "/event-categories/music.jpg",
    buttonText: "Music Concert",
    buttonLink: "/events/music",
  },
  {
    id: "comedy",
    title: "Laugh Out Loud",
    image: "/event-categories/comedy.jpg",
    buttonText: "Stand-Up Comedy",
    buttonLink: "/events/comedy",
  },
  {
    id: "tech",
    title: "Let's Talk",
    image: "/event-categories/tech.jpg",
    buttonText: "Tech Talks",
    buttonLink: "/events/tech",
  },
  {
    id: "dance",
    title: "Move To The Beat",
    image: "/event-categories/dance.jpg",
    buttonText: "Dance Shows",
    buttonLink: "/events/dance",
  },
  {
    id: "sports",
    title: "Feel The Action",
    image: "/event-categories/sports.jpg",
    buttonText: "Sports Events",
    buttonLink: "/events/sports",
  },
];

interface CategoryCardProps {
  category: {
    id: string;
    title: string;
    image: string;
    buttonText: string;
    buttonLink: string;
  };
  isHovered: boolean;
  onHover: (id: string) => void;
  onLeave: () => void;
}

const CategoryCard = ({
  category,
  isHovered,
  onHover,
  onLeave,
}: CategoryCardProps) => {
  return (
    <div
      className="relative overflow-hidden rounded-lg aspect-square flex-shrink-0"
      onMouseEnter={() => onHover(category.id)}
      onMouseLeave={() => onLeave()}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={category.image}
          alt={category.title}
          fill
          className={`object-contain transition-transform duration-500 ease-in-out ${
            isHovered ? "scale-105" : "scale-100"
          }`}
          priority
        />
      </div>

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isHovered ? "opacity-60" : "opacity-30"
        }`}
      />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div
          className={`transform transition-all duration-300 ease-in-out ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <h3 className="text-white text-3xl font-bold">{category.title}</h3>
        </div>

        <div
          className={`transform transition-all duration-300 ease-in-out ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
          }`}
        >
          <Link
            href={category.buttonLink}
            className="inline-flex items-center justify-between bg-white text-black font-medium px-6 py-3 rounded-md w-full"
          >
            <span>{category.buttonText}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function CategoriesCarousel() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Number of fully visible cards (we'll show partial cards at edges)
  const visibleItems = 2.5; // 2 full cards and part of a third one
  const maxIndex = categories.length - Math.ceil(visibleItems);

  const showNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop back to the beginning
      setCurrentIndex(0);
    }
  };

  const showPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Loop to the end
      setCurrentIndex(maxIndex);
    }
  };

  // Check if we're at the end of the carousel
  const isAtEnd = currentIndex >= maxIndex;

  useEffect(() => {
    if (carouselRef.current) {
      const translateX = -currentIndex * (100 / categories.length);
      carouselRef.current.style.transform = `translateX(${translateX}%)`;
    }
  }, [currentIndex, categories.length]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12">
        Categories
      </h2>
      <div className="relative">
        <div className="overflow-hidden">
          <div
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ width: `${categories.length * 33.33}%` }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className="px-2"
                style={{ width: `${100 / categories.length}%` }}
              >
                <CategoryCard
                  category={category}
                  isHovered={hoveredId === category.id}
                  onHover={setHoveredId}
                  onLeave={() => setHoveredId(null)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Previous button - shown except at the start */}
        {currentIndex > 0 && (
          <button
            onClick={showPrev}
            className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg transition-transform hover:scale-110 z-10"
            aria-label="Show previous categories"
          >
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
        )}

        {/* Next button - shown except at the end */}
        {!isAtEnd && (
          <button
            onClick={showNext}
            className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg transition-transform hover:scale-110 z-10"
            aria-label="Show more categories"
          >
            <ChevronRight className="h-6 w-6 text-black" />
          </button>
        )}
      </div>
    </div>
  );
}
