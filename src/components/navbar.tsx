"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react"; // For search and dropdown arrow
import { signIn, signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown
  const { data: session } = useSession(); // Destructure session data
  const dropdownRef = useRef<HTMLDivElement>(null); // Explicitly set the type

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" }); // Redirect to root after sign out
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"
          : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 mr-8">
              <div className="relative w-16 h-16">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/events"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Events
              </Link>
            </div>
          </div>
          <div className="flex-1 max-w-md px-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:text-gray-900 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search events, artists..."
              />
            </div>
          </div>
          <div className="flex items-center">
            {session?.user ? (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  className="flex items-center text-white focus:outline-none"
                  onClick={toggleDropdown}
                >
                  <div className="relative w-8 h-8">
                    <Image
                      src={session.user.image || "/default-avatar.png"}
                      alt="User Avatar"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {session.user.name}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10">
                    {session.user.ArtistProfile ? (
                      <Link
                        href="/artist/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Switch to Artist Profile
                      </Link>
                    ) : (
                      <Link
                        href="/artist/create"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Create Artist Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-black bg-[#DEFF58] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                onClick={() => signIn("google")}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
