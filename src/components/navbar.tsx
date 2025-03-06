"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, ChevronDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ShimmerButton } from "./magicui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  const { data: session } = useSession();
  const [placeholder, setPlaceholder] = useState("events");
  const [_isTransitioning, setIsTransitioning] = useState(false);
  const [open, setOpen] = useState(false);

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

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-lg">
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

          <div className="hidden md:block md:flex-1">
            <div className="flex items-center justify-center space-x-8">
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
              <div className="relative">
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-2 h-auto flex items-center gap-2 hover:bg-gray-800 rounded-lg"
                    >
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-700">
                        <AvatarImage
                          src={session.user.image || "/default-avatar.png"}
                          alt={session.user.name || "User"}
                        />
                        <AvatarFallback className="bg-gray-800 text-white text-lg">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-lg font-medium text-white hidden sm:inline max-w-[120px] truncate">
                        {session.user.name}
                      </span>
                      <ChevronDown className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={5}
                    className="bg-gray-900 border border-gray-800 text-white p-2 rounded-lg w-[200px] max-w-[95vw] fixed"
                  >
                    {session.user.role === "ARTIST" ? (
                      <DropdownMenuItem className="px-0 py-0 focus:bg-transparent">
                        <Link
                          href="/artist/profile"
                          className="w-full px-2 py-2 block cursor-pointer hover:bg-gray-800 rounded-md"
                          onClick={() => setOpen(false)}
                        >
                          Switch to Artist Profile
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="px-0 py-0 focus:bg-transparent">
                        <Link
                          href="/artist/create"
                          className="w-full px-4 py-2 block cursor-pointer hover:bg-gray-800 rounded-md"
                          onClick={() => setOpen(false)}
                        >
                          Create Artist Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full px-4 py-2 mt-1 cursor-pointer hover:bg-gray-800 rounded-md text-red-400 focus:bg-gray-800 focus:text-red-400"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/signup">
                <ShimmerButton className="h-12 px-6 py-3 text-lg font-semibold hover:text-[#DEFF58]">
                  signup
                </ShimmerButton>
              </Link>
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
