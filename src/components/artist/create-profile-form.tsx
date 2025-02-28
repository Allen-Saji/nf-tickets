"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { ArrowRight, Upload } from "lucide-react";
import { Particles } from "@/components/magicui/particles";
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

// Define category enum
enum Category {
  Music = "Music",
  Comedy = "Comedy",
  Tech = "Tech",
  Dance = "Dance",
  Sports = "Sports",
}

// Define the form validation schema
const ArtistProfileSchema = z.object({
  artistName: z.string().min(1, "Artist name is required"),
  bio: z.string().optional(),
  category: z.nativeEnum(Category, {
    required_error: "Please select a category",
  }),
  profilePicture: z.any().optional(),
  backgroundImage: z.any().optional(),
});

type ArtistProfileFormData = z.infer<typeof ArtistProfileSchema>;

export default function CreateArtistProfileForm() {
  const router = useRouter();

  // Initialize the form with react-hook-form
  const form = useForm<ArtistProfileFormData>({
    resolver: zodResolver(ArtistProfileSchema),
    defaultValues: {
      artistName: "",
      bio: "",
      category: undefined,
      profilePicture: undefined,
      backgroundImage: undefined,
    },
  });

  // Use the tRPC mutation
  const createProfile = api.artist.create.useMutation({
    onSuccess: () => {
      router.push("/profile");
      router.refresh();
    },
  });

  const onSubmit = async (data: ArtistProfileFormData) => {
    try {
      // Here you would handle file uploads first, then submit the form
      // For this example, we'll just log the data
      console.log("Form data:", data);

      // Once you have the URLs from the uploaded files:
      // const formattedData = {
      //   artistName: data.artistName,
      //   bio: data.bio,
      //   category: data.category,
      //   profilePictureUrl: uploadedProfilePicUrl,
      //   backgroundImageUrl: uploadedBackgroundUrl,
      // };

      // await createProfile.mutateAsync(formattedData);
    } catch (error) {
      console.error("Error creating artist profile:", error);
    }
  };

  return (
    <div className="flex items-center justify-center bg-black text-white min-h-screen overflow-hidden">
      <Card className="w-full max-w-xl bg-[#10121f] border border-gray-800 rounded-lg shadow-xl z-10">
        <CardContent className="pt-6 pb-8">
          <h1 className="text-2xl font-bold mb-6">
            Create <span className="text-[#DEFF58]">Artist Profile</span>
          </h1>

          {createProfile.error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
              {createProfile.error.message}
            </div>
          )}

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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Category
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1a1d2d] border-gray-700 h-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm">
                          <SelectValue placeholder="Select your category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1d2d] border-gray-700 text-white [&_.select-item:hover]:bg-[#DEFF58] [&_.select-item:hover]:text-black">
                        {Object.values(Category).map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="select-item"
                          >
                            {category}
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
                          <div className="bg-[#1a1d2d] border border-gray-700 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-[#262a3d] transition-colors">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="profilePicture"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                onChange(file);
                              }}
                              {...field}
                            />
                            <label
                              htmlFor="profilePicture"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <Upload className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-400">
                                Upload image
                              </span>
                            </label>
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-400">
                          Image should be less than 5MB
                        </p>
                        {value && (
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
                                onChange(file);
                              }}
                              {...field}
                            />
                            <label
                              htmlFor="backgroundImage"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <Upload className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-400">
                                Upload banner
                              </span>
                            </label>
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-400">
                          Image should be less than 5MB
                        </p>
                        {value && (
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
                disabled={createProfile.isPending}
                className="w-full mt-6 bg-[#DEFF58] text-black font-semibold rounded-full h-12 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-[1.02]"
              >
                {createProfile.isPending
                  ? "Creating..."
                  : "Create Artist Profile"}
                <ArrowRight className="w-5 h-5 ml-2" />
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
