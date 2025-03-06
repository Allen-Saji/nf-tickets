"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { ArrowRight, Upload, Loader2, Lock } from "lucide-react";
import { Particles } from "@/components/magicui/particles";
import { useState } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { signIn } from "next-auth/react";

enum Genre {
  Music = "Music",
  Comedy = "Comedy",
  Tech = "Tech",
  Dance = "Dance",
  Sports = "Sports",
}

const ArtistProfileSchema = z
  .object({
    email: z.string().email("Valid email is required"),
    artistName: z.string().min(1, "Artist name is required"),
    bio: z.string().optional(),
    genre: z.nativeEnum(Genre, {
      required_error: "Please select a genre",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    profilePicture: z.any().optional(),
    backgroundImage: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ArtistProfileFormData = z.infer<typeof ArtistProfileSchema>;

export default function CreateArtistProfileForm() {
  const router = useRouter();
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Image upload states
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<ArtistProfileFormData>({
    resolver: zodResolver(ArtistProfileSchema),
    defaultValues: {
      email: "",
      artistName: "",
      bio: "",
      genre: undefined,
      password: "",
      confirmPassword: "",
      profilePicture: undefined,
      backgroundImage: undefined,
    },
  });

  // Use the tRPC mutation
  const createProfile = api.artist.signup.useMutation({
    onSuccess: () => {
      toast.success("Profile Created", {
        description: "Your artist profile has been created successfully.",
        duration: 5000,
        className: "bg-[#1a1d2d] border-green-500 text-white",
      });
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Error Creating Profile", {
        description: error.message || "Failed to create artist profile",
        duration: 5000,
        action: {
          label: "Try Again",
          onClick: () => form.handleSubmit(onSubmit)(),
        },
      });
    },
  });

  const uploadImage = async (file: File, isProfilePic: boolean = true) => {
    try {
      if (isProfilePic) {
        setIsUploadingProfilePic(true);
      } else {
        setIsUploadingBanner(true);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "nf-tickets");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Image upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Image upload failed";
      toast.error("Upload Error", {
        description: errorMessage,
        duration: 5000,
      });
      return "";
    } finally {
      if (isProfilePic) {
        setIsUploadingProfilePic(false);
      } else {
        setIsUploadingBanner(false);
      }
    }
  };

  const onSubmit = async (data: ArtistProfileFormData) => {
    try {
      let profilePictureUrl = "";
      let backgroundImageUrl = "";

      if (data.profilePicture instanceof File) {
        profilePictureUrl = await uploadImage(data.profilePicture, true);
        if (!profilePictureUrl) return; // Stop if upload failed
      }

      if (data.backgroundImage instanceof File) {
        backgroundImageUrl = await uploadImage(data.backgroundImage, false);
        if (!backgroundImageUrl) return; // Stop if upload failed
      }

      const formattedData = {
        // User data
        name: data.artistName,
        email: data.email,
        password: data.password,
        // Artist profile data
        artistName: data.artistName,
        bio: data.bio || "",
        genre: data.genre,
        profilePictureUrl,
        backgroundImageUrl,
      };

      await createProfile.mutateAsync(formattedData);
      await signIn(
        "credentials",
        {
          redirect: false,
          email: data.email,
          password: data.password,
        },
        { callbackUrl: "/" }
      );
    } catch (error) {
      console.error("Error creating artist profile:", error);
      toast.error("Something went wrong", {
        description: "Failed to create your artist profile",
        duration: 5000,
      });
    }
  };

  const handleGoBack = () => {
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center bg-black text-white min-h-screen overflow-hidden">
      <Card className="w-full max-w-xl bg-[#10121f] border border-gray-800 rounded-lg shadow-xl z-10">
        <CardContent className="pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              <span className="text-[#DEFF58]">Artist</span> Signup
            </h1>
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="text-gray-400 hover:text-white"
            >
              Back
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Artist Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your stage name or performance identity"
                        {...field}
                        className="bg-[#1a1d2d] border-gray-700 h-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your email address"
                        type="email"
                        {...field}
                        className="bg-[#1a1d2d] border-gray-700 h-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Genre
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1a1d2d] border-gray-700 h-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm">
                          <SelectValue placeholder="Select your genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1d2d] border-gray-700 text-white [&_.select-item:hover]:bg-[#DEFF58] [&_.select-item:hover]:text-black">
                        {Object.values(Genre).map((genre) => (
                          <SelectItem
                            key={genre}
                            value={genre}
                            className="select-item"
                          >
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                          className="bg-[#1a1d2d] border-gray-700 h-10 pl-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                    <p className="text-xs text-gray-400 mt-1">
                      Password must be at least 8 characters and include
                      uppercase, lowercase and numbers
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                          className="bg-[#1a1d2d] border-gray-700 h-10 pl-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Bio
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your story, achievements, style, or what makes your performances unique..."
                        {...field}
                        className="bg-[#1a1d2d] border-gray-700 focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white resize-none h-28 placeholder:text-gray-500 rounded-md text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 text-sm font-medium">
                        Profile Picture
                      </FormLabel>
                      <div className="flex flex-col gap-2">
                        <FormControl>
                          <div className="bg-[#1a1d2d] border border-gray-700 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-[#262a3d] transition-colors relative">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="profilePicture"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.size > 5 * 1024 * 1024) {
                                  toast.error("File too large", {
                                    description:
                                      "Profile picture must be less than 5MB",
                                  });
                                  return;
                                }
                                onChange(file);
                              }}
                              disabled={isUploadingProfilePic}
                              {...field}
                            />
                            <label
                              htmlFor="profilePicture"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              {isUploadingProfilePic ? (
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-400">
                                {isUploadingProfilePic
                                  ? "Uploading..."
                                  : "Upload image"}
                              </span>
                            </label>
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-400">
                          Image should be less than 5MB
                        </p>
                        {value && !isUploadingProfilePic && (
                          <p className="text-xs text-green-400">
                            File selected: {value.name}
                          </p>
                        )}
                      </div>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backgroundImage"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 text-sm font-medium">
                        Background Banner
                      </FormLabel>
                      <div className="flex flex-col gap-2">
                        <FormControl>
                          <div className="bg-[#1a1d2d] border border-gray-700 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-[#262a3d] transition-colors">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="backgroundImage"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.size > 5 * 1024 * 1024) {
                                  toast.error("File too large", {
                                    description:
                                      "Banner image must be less than 5MB",
                                  });
                                  return;
                                }
                                onChange(file);
                              }}
                              disabled={isUploadingBanner}
                              {...field}
                            />
                            <label
                              htmlFor="backgroundImage"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              {isUploadingBanner ? (
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-400">
                                {isUploadingBanner
                                  ? "Uploading..."
                                  : "Upload banner"}
                              </span>
                            </label>
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-400">
                          Image should be less than 5MB
                        </p>
                        {value && !isUploadingBanner && (
                          <p className="text-xs text-green-400">
                            File selected: {value.name}
                          </p>
                        )}
                      </div>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={
                  createProfile.isPending ||
                  isUploadingProfilePic ||
                  isUploadingBanner
                }
                className="w-full mt-6 bg-[#DEFF58] text-black font-semibold rounded-full h-12 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-[1.02]"
              >
                {createProfile.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Artist Profile
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Particles
        className="absolute inset-0 z-0"
        quantity={200}
        ease={80}
        color={"#DEFF58"}
        refresh
      />
    </div>
  );
}
