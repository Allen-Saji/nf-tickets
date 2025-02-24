"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalButton } from "@solana/wallet-adapter-react-ui"; // For wallet connect modal
import { useSession } from "next-auth/react";

type FormData = {
  artistName: string;
  bio: string;
  category: string;
};

const ArtistProfileForm = () => {
  const [formData, setFormData] = useState<FormData>({
    artistName: "",
    bio: "",
    category: "",
  });
  const { data: session } = useSession();
  const userId = session?.user?.uid;
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wallet connection hooks
  const wallet = useWallet();
  const connection = useConnection();

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.artistName.trim()) {
      newErrors.artistName = "Artist name is required";
    }
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!wallet.connected) {
      setError("Please connect your wallet before submitting");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Call the createManager function to create the PDA and let the user pay
      const managerPda = await createManager(wallet, connection);
      console.log("Manager PDA:", managerPda.toString());

      const submissionData = {
        ...formData,
        walletAddress: wallet.publicKey,
        userId: userId,
      };

      const response = await fetch("/api/artist/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again later.");
      } else {
        setFormData({ artistName: "", bio: "", category: "" });
        console.log(await response.json());
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (error && wallet.connected) {
      setError(null);
      if (wallet.connected) {
      }
      console.log("public key", wallet.publicKey?.toString());
      console.log("connection", connection);
    }
  }, [wallet.connected, error]);

  return (
    <div className="min-h-screen bg-[#DEFF58] text-black p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl relative">
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          {!wallet.connected ? (
            <WalletModalButton className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
              Connect Wallet
            </WalletModalButton>
          ) : (
            <>
              <p className="text-green-600">Wallet Connected</p>
              <button
                onClick={wallet.disconnect}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
        <div className="p-8 pt-16">
          <h1 className="text-2xl font-bold mb-6">Create Artist Profile</h1>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="artistName"
                className="block text-sm font-medium text-gray-700"
              >
                Artist Name
              </label>
              <input
                type="text"
                id="artistName"
                name="artistName"
                value={formData.artistName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter artist name"
              />
              {errors.artistName && (
                <p className="mt-2 text-sm text-red-600">{errors.artistName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Tell us about yourself"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select category</option>
                <option value="Music">Music</option>
                <option value="Comedy">Comedy</option>
                <option value="Tech">Tech</option>
                <option value="Dance">Dance</option>
                <option value="Sports">Sports</option>
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !wallet.connected}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfileForm;
