import Image from "next/image";
import { Particles } from "@/components/magicui/particles";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Phone from "@/components/phone";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center px-6">
        <div className="relative w-full max-w-6xl mx-auto flex items-center justify-center py-16">
          <div className="absolute left-0 text-right z-10">
            <h1 className="text-5xl md:text-6xl font-bold whitespace-nowrap">
              <span className="text-[#DEFF58]">Let's </span>
              <br />
              into a<br />
              <span className="text-[#DEFF58]"> Booking </span>
            </h1>
          </div>

          <div className="relative h-[300px] md:h-[400px] w-[500px] md:w-[600px] ">
            <Image
              src="/solana.svg"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute right-0 text-left z-10">
            <h1 className="text-5xl md:text-6xl font-bold whitespace-nowrap justify-center">
              Transform
              <br />
              <span className="text-[#DEFF58]"> Digital </span>
              <br />
              Era
            </h1>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full max-w-6xl mx-auto border-t border-gray-800 my-6"></div>

        <div className="w-full max-w-3xl mx-auto text-center text-gray-300 pb-12">
          <p>
            Say goodbye to scalpers and fraud—own your event experience with NFT
            tickets. Secure, verifiable, and truly yours. Discover a new way to
            book, sell, and resell event tickets with transparency and fairness.
          </p>
          <Button className="mt-6 bg-[#DEFF58] text-black font-semibold rounded-full py-3 px-6 gap-2 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-105">
            Explore Shows
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto py-16 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              All your <span className="text-[#DEFF58]">favorite shows</span>{" "}
              under one roof
            </h2>
            <p className="mt-6 text-gray-300 max-w-lg">
              Access thousands of live events from around the world. Book
              tickets, get notified about upcoming shows, and never miss a
              moment.
            </p>
            <Button className="mt-8 bg-[#DEFF58] text-black font-semibold rounded-full py-3 px-6 gap-2 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-105">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <Phone />
        </div>
      </div>

      <Particles
        className="absolute inset-0 z-0"
        quantity={350}
        ease={80}
        color={"#DEFF58"}
        refresh
      />
    </main>
  );
}
