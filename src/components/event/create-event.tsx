"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Category } from "@prisma/client";
import { formSchema } from "./eventSchema";
import {
  ArrowRight,
  CalendarIcon,
  Loader2,
  Upload,
  Wallet,
} from "lucide-react";
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
import dynamic from "next/dynamic";
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  useProgram,
  setupManagerAndCreateEvent,
} from "@/app/lib/solana/instructions";

type FormValues = z.infer<typeof formSchema>;
export default function CreateEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { program, provider } = useProgram();
  const { connected, publicKey } = useWallet();

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      venue: "",
      city: "",
      capacity: 100,
      description: "",
      imageUrl: undefined,
      artistWallet: "",
      isTicketTransferable: false,
      managerPDA: "",
      eventPublicKey: "",
    },
  });

  useEffect(() => {
    if (connected && publicKey) {
      form.setValue("artistWallet", publicKey.toString());
    }
  }, [connected, publicKey, form]);

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

  const onSubmit = async (data: FormValues) => {
    if (!connected || !publicKey) {
      toast.error("Wallet Required", {
        description: "Please connect your wallet to create an event",
        duration: 5000,
      });
      return;
    }

    // Make sure program and provider are available
    if (!program || !provider) {
      toast.error("Wallet Connection Error", {
        description: "Could not connect to blockchain. Please try again.",
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);
    let imageUrl = data.imageUrl;

    try {
      // Handle image upload...

      // Step 2: Call blockchain function to set up manager and create event
      toast.loading("Creating event on blockchain...");

      // Format event data for blockchain
      const eventDate = data.eventDate;
      const dateString = eventDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const timeString = eventDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }); // Format: HH:MM

      // Prepare data for blockchain transaction
      const eventArgs = {
        name: data.eventName,
        category: data.category,
        uri: imageUrl?.toString() || "",
        city: data.city,
        venue: data.venue,
        artist: publicKey.toString(),
        date: dateString,
        time: timeString,
        capacity: data.capacity,
        isTicketTransferable: data.isTicketTransferable,
      };

      let blockchainResult;
      try {
        // Check connection to Solana network before proceeding
        // try {
        //   const testConnection = await provider.connection.getLatestBlockhash(
        //     "confirmed"
        //   );
        //   console.log("Network connection test successful");
        // } catch (connError: unknown) {
        //   toast.dismiss();
        //   toast.error("Network Connection Error", {
        //     description:
        //       "Could not connect to Solana network. Please check your internet connection and try again.",
        //     duration: 5000,
        //   });
        //   console.error("Network connection test failed:", connError);
        //   setIsSubmitting(false);
        //   return;
        // }

        blockchainResult = await setupManagerAndCreateEvent(
          publicKey,
          eventArgs,
          { program, provider }
        );

        if (!blockchainResult || !blockchainResult.success) {
          console.error("Transaction failed:", blockchainResult);
          throw new Error("transaction failed");
        }

        toast.dismiss();
        toast.success("Event created on blockchain", {
          description: "Your event was successfully created on-chain",
          duration: 3000,
          className: "bg-[#1a1d2d] border-green-500 text-white",
        });
      } catch (error: unknown) {
        toast.dismiss();

        // Properly handle unknown error type
        const err = error as Error;

        // Provide more specific error messages based on error type
        let errorDescription = "Failed to create event on the blockchain";
        if (err.message?.includes("failed to get recent blockhash")) {
          errorDescription =
            "Network connection issue. Please check your internet connection and try again.";
        } else if (err.message?.includes("insufficient funds")) {
          errorDescription =
            "Your wallet has insufficient funds for this transaction.";
        } else if (err.message?.includes("Connection to Solana failed")) {
          errorDescription =
            "Cannot connect to Solana network. Please try again later.";
        }

        toast.error("Blockchain Error", {
          description: errorDescription,
          duration: 5000,
        });
        console.error("Blockchain error details:", err);
        setIsSubmitting(false);
        return;
      }
      // Step 3: Save to database with blockchain references
      try {
        // Make sure we have all required blockchain data before proceeding
        if (
          !blockchainResult.managerPda ||
          !blockchainResult.eventPublicKey ||
          !blockchainResult.signature
        ) {
          throw new Error("Missing blockchain references");
        }

        // Format data for database with blockchain references
        const formattedData = {
          ...data,
          imageUrl,
          artistWallet: publicKey.toString(),
          managerPDA: blockchainResult.managerPda.toString(),
          eventPublicKey: blockchainResult.eventPublicKey.toString(),
          transactionSignature: blockchainResult.signature,
        };

        // Send to your database
        createEvent.mutate(formattedData);
        // Note: Success handling is in the createEvent.onSuccess callback
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Error creating event:", err);
        setIsSubmitting(false);
        toast.error("Something went wrong", {
          description: "Failed to save your event details",
          duration: 5000,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Unexpected error in event creation:", err);
      setIsSubmitting(false);
      toast.error("Error Creating Event", {
        description: "An unexpected error occurred",
        duration: 5000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-black text-white min-h-screen overflow-hidden">
      <Card className="w-full my-4 max-w-xl bg-[#10121f] border border-gray-800 rounded-lg shadow-xl z-10">
        <CardContent className="pt-6 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              Create <span className="text-[#DEFF58]">New Event</span>
            </h1>

            <div className="wallet-adapter-wrapper">
              <WalletMultiButton />
            </div>
          </div>

          <div className="mb-6 p-3 bg-[#1a1d2d] rounded-md border border-gray-700">
            <p className="text-sm flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              {connected ? (
                <span className="text-green-400">
                  Wallet Connected: {publicKey?.toString().slice(0, 6)}...
                  {publicKey?.toString().slice(-4)}
                </span>
              ) : (
                <span className="text-amber-400">
                  Please connect your wallet to create an event
                </span>
              )}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <input
                type="hidden"
                {...form.register("artistWallet")}
                value={publicKey?.toString() || ""}
              />
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
                        disabled={!connected}
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
                              disabled={!connected}
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
                            disabled={(date) => date < new Date() || !connected}
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
                        disabled={!connected}
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
                          disabled={!connected}
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
                          disabled={!connected}
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
                        disabled={!connected}
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
                name="imageUrl"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200 text-sm font-medium">
                      Event Image
                    </FormLabel>
                    <div className="flex flex-col gap-2">
                      <FormControl>
                        <div
                          className={`bg-[#1a1d2d] border border-gray-700 border-dashed rounded-md p-4 text-center transition-colors relative ${
                            connected
                              ? "hover:bg-[#262a3d] cursor-pointer"
                              : "opacity-70"
                          }`}
                        >
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="imageUrl"
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
                            disabled={isUploadingImage || !connected}
                            {...field}
                          />
                          <label
                            htmlFor="imageUrl"
                            className={`flex flex-col items-center gap-2 ${
                              connected
                                ? "cursor-pointer"
                                : "cursor-not-allowed"
                            }`}
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
                        disabled={!connected}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400">
                      Provide details about what attendees can expect
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isTicketTransferable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-[#1a1d2d] p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-200 text-sm font-medium">
                        Allow Ticket Transfers
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-400">
                        Enable attendees to transfer tickets to others
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="relative inline-block">
                        <div
                          onClick={() =>
                            connected && field.onChange(!field.value)
                          }
                          className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                            field.value ? "bg-[#DEFF58]" : "bg-gray-700"
                          } ${
                            connected
                              ? "cursor-pointer"
                              : "cursor-not-allowed opacity-60"
                          } border-2 border-gray-600 flex items-center`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                              field.value ? "translate-x-7" : "translate-x-1"
                            } border border-gray-400`}
                          ></div>
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={field.value}
                          onChange={(e) =>
                            connected && field.onChange(e.target.checked)
                          }
                          disabled={!connected}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImage || !connected}
                className="w-full mt-6 bg-[#DEFF58] text-black font-semibold rounded-full h-12 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : !connected ? (
                  <>
                    Connect Wallet to Create Event
                    <Wallet className="w-5 h-5 ml-2" />
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
