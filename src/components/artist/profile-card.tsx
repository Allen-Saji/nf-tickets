import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Instagram, Twitter, Youtube } from 'lucide-react';

const ComedianProfileCard = () => {
  return (
    <Card className="w-full h-screen bg-black text-white overflow-hidden">
      <div className="relative h-48">
        {/* Background Image */}
        <img 
          src="https://s3-alpha-sig.figma.com/img/278d/22ca/72d58cfe18b49c188c5c6279ab51ce49?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=ZFCXoxG8fD2pSnl7Wrs376q04XWNzcHWnmu23xFPWMxocHZW8cw0fJS2hrMkd5qUbdvnKpEfwdIdoxp0gbaHnnLWVO8JuBfneS5eoLvwaPwXPyeHQ345gLoayTnls86rTUL2K3hvE7D2~~pBcugPzFi-DCL8TArSjuH8bblZHZe1Mou94e5MdwtaX4HXcxlnbHE4GzTb-9FMvZnUzqMu2a4RIsJHhyTNu379JNOMFnerfTi7hcrWUWRuzWm~bx9yUsj1k-siKI2QDx3y3bAwuxExDBiBbuc-XljLjaQ6iAPr8HKR3WkpPVT5I2XqT2FufoIgeb0qJ31vqB37WHqMUA__" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <Button 
          variant="outline" 
          className="absolute bottom-2 right-14 z-10 rounded-full border border-white bg-[#DEFF58] text-black hover:bg-gray-200 hover:text-black flex items-center space-x-2"
        >
          {/* Plus Icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Follow</span>
        </Button>
      </div>
      
      <CardContent className="grid grid-cols-12 gap-4 p-4 relative">
        {/* Profile Image and Info */}
        <div className="col-span-5 flex items-center">
          <div className="w-56 h-56 overflow-hidden mr-4">
            <img 
              src="https://s3-alpha-sig.figma.com/img/a1a3/eb70/d6d5b752d4ad392be2116951ceb219c7?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=KVBoF-fDerjQAswjTnIq-ifqnrdz0OWAYreJD7nb7noVszdT~Kl9O31wYSMf~BOgv1HD1aXAZUP6uLk6eZpSzym1IKwOwdVqRlGqpiBju3iHmazfAOmt8ZtBLoVelkzfFJJ2Wb4mOo7dE2qn3jiXYTaDGwVlwz5WGnDZm1kupX36R16i6zv9sesohpAZwF0bTESJKXreXHUyo-ryp88o8nllI0EoP72PmepZsVs8Hx9q-jUZc3PL3EnXj-lnKHcxTHcveUZaItLrjxaeIEGQIqP9moPLbeNafw2~Ue-lLydQiXgh3NljsWGXpvJ2r~KJs0GM8sbwCBZEnV53iExTnQ__" 
              alt="Matt Rife" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <Badge className="bg-lime-400 text-black mb-2">Verified Artist</Badge>
            <h1 className="text-3xl font-bold text-lime-400">Matt Rife</h1>
            <p className="text-gray-300">Stand-Up Comedian</p>
            <p className="text-gray-300">250+ Shows done</p>
            <p className="text-gray-300">75,000 followers</p>
          </div>
        </div>

        {/* Shows Done */}
        <div className="col-span-3">
          <div className="flex h-36 items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white">250+</h2>
              <p className="text-gray-400">Shows Done</p>
            </div>
          </div>
          {/* Book Button */}
          <div className="flex justify-center items-center">
            <Button className="col-span-3 bg-[#DEFF58] text-black hover:bg-white mt-4">
              Book him for a show
            </Button>
          </div>       
        </div>

        {/* Socials */}
        <div className="col-span-3 mt-4">
          <h3 className="text-xl font-semibold mb-2">Socials</h3>
          <div className="grid grid-cols-1 gap-2 text-black">
            <Button variant="outline" className="w-full rounded-[2rem] h-12 px-6 bg-white hover:bg-[#DEFF58] hover:text-black">
              <span className="flex justify-between items-center w-full ">
                <Instagram className="h-5 w-5" />
                <span className="flex-grow text-center">Instagram</span>
              </span>
            </Button>
            <Button variant="outline" className="w-full rounded-[2rem] h-12 px-6 bg-white hover:bg-[#DEFF58] hover:text-black">
              <span className="flex justify-between items-center w-full">
                <Twitter className="h-5 w-5 " />
                <span className="flex-grow text-center">Twitter</span>
              </span>
            </Button>
            <Button variant="outline" className="w-full rounded-[2rem] h-12 px-6 bg-white hover:bg-[#DEFF58] hover:text-black">
              <span className="flex justify-between items-center w-full">
                <Youtube className="h-5 w-5" />
                <span className="flex-grow text-center">YouTube</span>
              </span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* About Section */}
      <div className="p-4 bg-[#171717] text-white">
        <h2 className="text-3xl font-bold mb-2">About</h2>
        <p>
          Matthew Steven Rife (born September 10, 1995) is an American comedian and actor. From the village of North Lewisburg, Ohio, Rife is best known for his self-produced comedy specials Only Fans (2021), Matthew Steven Rife (2023) and Walking Red Flag (2023), his 2023 Netflix specials Natural Selection and Lucid, as well as his previous recurring role on the sketch improv comedy and rap show Wild 'n Out.
        </p>
      </div>
    </Card>
  );
};

export default ComedianProfileCard;
