"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, ChevronDown } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { ShimmerButton } from "./magicui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const [placeholder, setPlaceholder] = useState("events");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const texts = ["events", "artists", "venues"];
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % texts.length;
        setPlaceholder(texts[currentIndex]);
        setIsTransitioning(false);
      }, 500);
    }, 3000);

    return () => clearInterval(intervalId);
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
        isScrolled ? "bg-black bg-opacity-50 backdrop-blur-lg" : "bg-black"
      } `}
    >
      <div className="w-full max-w-full px-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between h-20">
          <div className="flex-none">
            <Link href="/" className="flex-shrink-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="flex items-center space-x-8 mx-auto">
              <Link
                href="/"
                className="text-white hover:text-[#DEFF58] px-4 py-2 rounded-md text-lg font-semibold"
              >
                Home
              </Link>
              <Link
                href="/events"
                className="text-white hover:text-[#DEFF58] px-4 py-2 rounded-md text-lg font-semibold"
              >
                Events
              </Link>
              <div className="relative flex items-center w-72">
                <Search className="absolute left-3 h-6 w-6 text-gray-400" />
                <Input
                  type="text"
                  className="pl-12 py-3 h-12 w-full bg-gray-800 text-gray-300 border-transparent focus:ring-0 rounded-full focus:bg-gray-700 focus:text-gray-100 text-lg"
                  placeholder={`Search for ${placeholder}`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto">
                    <div className="flex items-center">
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                        <Image
                          src={session.user.image || "/default-avatar.png"}
                          alt="User Avatar"
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <span className="ml-2 text-lg font-medium text-white hidden sm:inline">
                        {session.user.name}
                      </span>
                      <ChevronDown className="ml-2 h-5 w-5 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {session.user.ArtistProfile ? (
                    <DropdownMenuItem asChild>
                      <Link href="/artist/profile">
                        Switch to Artist Profile
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/artist/create">Create Artist Profile</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <ShimmerButton
                onClick={() => signIn("google")}
                className="h-12 px-6 py-3 text-lg font-semibold hover:text-[#DEFF58]"
              >
                Login
              </ShimmerButton>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white p-2"
                >
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-gray-900 text-white border-gray-800"
              >
                <div className="flex flex-col h-full space-y-6">
                  <div className="relative mt-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <Input
                      type="text"
                      className="pl-14 py-3 bg-gray-800 text-gray-300 border-transparent focus:ring-0 rounded-full"
                      placeholder={`Search for ${placeholder}`}
                    />
                  </div>
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className="block px-6 py-3 rounded-md text-xl font-semibold hover:bg-gray-800"
                    >
                      Home
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/events"
                      className="block px-6 py-3 rounded-md text-xl font-semibold hover:bg-gray-800"
                    >
                      Events
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
