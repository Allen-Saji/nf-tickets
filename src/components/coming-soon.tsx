"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import img from "../../public/nftticket.png";
import Image from "next/image";

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [email, setEmail] = useState("");

  useEffect(() => {
    const targetDate = new Date("2024-12-31T00:00:00"); // Set your target date here

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      const days = Math.floor(difference / (10000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });

      if (difference < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Implement email submission logic here
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <div className="relative h-[60vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 1.5 }}
      >
        <Image
          src={img}
          alt="Coming Soon Background"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 bg-black opacity-50 z-10" />

      <div className="relative z-20 text-center px-4">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Coming Soon
        </motion.h1>

        <motion.div
          className="flex justify-center space-x-4 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="text-center">
              <div className="text-4xl font-bold">{value}</div>
              <div className="text-sm uppercase">{unit}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
