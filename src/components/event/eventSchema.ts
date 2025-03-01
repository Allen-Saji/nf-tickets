import { z } from "zod";
import { Category } from "@prisma/client";

export const formSchema = z.object({
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
  artistWallet: z.string(),
  isTicketTransferable: z.boolean().default(false),
});
