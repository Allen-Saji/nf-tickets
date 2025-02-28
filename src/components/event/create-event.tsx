"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Category } from "@prisma/client";
import { ArrowRight, CalendarIcon, Loader2, Upload } from "lucide-react";
import { Particles } from "@/components/magicui/particles";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

// Validation schema
const formSchema = z.object({
  eventName: z
    .string()
    .min(3, {
      message: "Event name must be at least 3 characters.",
    })
    .max(100, {
      message: "Event name must not exceed 100 characters.",
    }),
  eventDate: z
    .date({
      required_error: "Please select a date for the event.",
    })
    .refine((date) => date > new Date(), {
      message: "Event date must be in the future.",
    }),
  venue: z
    .string()
    .min(3, {
      message: "Venue must be at least 3 characters.",
    })
    .max(100, {
      message: "Venue must not exceed 100 characters.",
    }),
  city: z
    .string()
    .min(2, {
      message: "City must be at least 2 characters.",
    })
    .max(50, {
      message: "City must not exceed 50 characters.",
    }),
  category: z.nativeEnum(Category, {
    required_error: "Please select an event category.",
  }),
  capacity: z.coerce.number().int().positive({
    message: "Capacity must be a positive number.",
  }),
  description: z.string().optional(),
  eventImage: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // tRPC hook for creating an event
  const createEvent = api.event.create.useMutation({
    onSuccess: () => {
      toast.success("Event Created", {
        description: "Your event has been created successfully.",
        duration: 5000,
        className: "bg-[#1a1d2d] border-green-500 text-white",
      });
      router.push("/dashboard/events");
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error("Error Creating Event", {
        description: error.message || "Failed to create event",
        duration: 5000,
        action: {
          label: "Try Again",
          onClick: () => form.handleSubmit(onSubmit)(),
        },
      });
    },
  });

  // Form setup with zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      venue: "",
      city: "",
      capacity: 100,
      description: "",
      eventImage: undefined,
    },
  });

  // Image upload handler
  const uploadImage = async (file: File) => {
    try {
      setIsUploadingImage(true);

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
      setIsUploadingImage(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      let eventImageUrl = "";

      if (data.eventImage instanceof File) {
        eventImageUrl = await uploadImage(data.eventImage);
        if (!eventImageUrl) {
          setIsSubmitting(false);
          return; // Stop if upload failed
        }
      }

      const formattedData = {
        ...data,
        eventImageUrl,
      };

      createEvent.mutate(formattedData);
    } catch (error) {
      console.error("Error creating event:", error);
      setIsSubmitting(false);
      toast.error("Something went wrong", {
        description: "Failed to create your event",
        duration: 5000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-black text-white min-h-screen overflow-hidden">
      <Card className="w-full max-w-xl bg-[#10121f] border border-gray-800 rounded-lg shadow-xl z-10">
        <CardContent className="pt-6 pb-8">
          <h1 className="text-2xl font-bold mb-6">
            Create <span className="text-[#DEFF58]">New Event</span>
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Event Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your event name"
                        {...field}
                        className="bg-[#1a1d2d] border-gray-700 h-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-gray-200 text-sm font-medium">
                        Event Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full bg-[#1a1d2d] border-gray-700 h-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span className="text-gray-500">
                                  Select date
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="bg-[#1a1d2d] border-gray-700 text-white"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="text-white"
                          />
                        </PopoverContent>
                      </Popover>
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
                            <SelectValue placeholder="Select category" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 text-sm font-medium">
                        Venue
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter venue name"
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 text-sm font-medium">
                        City
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter city name"
                          {...field}
                          className="bg-[#1a1d2d] border-gray-700 h-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Capacity
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter event capacity"
                        {...field}
                        className="bg-[#1a1d2d] border-gray-700 h-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400">
                      Maximum number of attendees allowed
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventImage"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Event Image
                    </FormLabel>
                    <div className="flex flex-col gap-2">
                      <FormControl>
                        <div className="bg-[#1a1d2d] border border-gray-700 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-[#262a3d] transition-colors relative">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="eventImage"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && file.size > 5 * 1024 * 1024) {
                                toast.error("File too large", {
                                  description:
                                    "Event image must be less than 5MB",
                                });
                                return;
                              }
                              onChange(file);
                            }}
                            disabled={isUploadingImage}
                            {...field}
                          />
                          <label
                            htmlFor="eventImage"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            {isUploadingImage ? (
                              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            ) : (
                              <Upload className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-400">
                              {isUploadingImage
                                ? "Uploading..."
                                : "Upload event image"}
                            </span>
                          </label>
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-400">
                        Image should be less than 5MB
                      </p>
                      {value && !isUploadingImage && (
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event, what attendees can expect..."
                        {...field}
                        className="bg-[#1a1d2d] border-gray-700 focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white resize-none h-28 placeholder:text-gray-500 rounded-md text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400">
                      Provide details about what attendees can expect
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="w-full mt-6 bg-[#DEFF58] text-black font-semibold rounded-full h-12 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Event
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
        quantity={300}
        ease={80}
        color={"#DEFF58"}
        refresh
      />
    </div>
  );
}
