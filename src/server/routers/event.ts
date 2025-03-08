import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Category } from "@prisma/client";

export const eventRouter = createTRPCRouter({
  // Get all events with optional filtering
  getAll: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(Category).optional(),
        city: z.string().optional(),
        artistId: z.number().optional(),
        skip: z.number().optional(),
        take: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { category, city, artistId, skip = 0, take = 10 } = input;

      const events = await ctx.db.event.findMany({
        where: {
          ...(category ? { category } : {}),
          ...(city ? { city } : {}),
          ...(artistId ? { artistId } : {}),
        },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          eventDate: "asc",
        },
      });

      const totalCount = await ctx.db.event.count({
        where: {
          ...(category ? { category } : {}),
          ...(city ? { city } : {}),
          ...(artistId ? { artistId } : {}),
        },
      });

      return {
        events,
        totalCount,
      };
    }),

  // Get event by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const event = await ctx.db.event.findUnique({
        where: { id },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      return event;
    }),

  // Create a new event (only for artists)
  create: protectedProcedure
    .input(
      z.object({
        eventName: z.string().min(3).max(100),
        eventDate: z.date(),
        venue: z.string().min(3).max(100),
        city: z.string().min(2).max(50),
        category: z.nativeEnum(Category),
        capacity: z.number().int().positive(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        artistWallet: z.string(),
        managerPDA: z.string(),
        isTicketTransferable: z.boolean().default(false),
        eventPublicKey: z.string(),
        ticketPrice: z.number().min(0),
        ticketsRemaining: z.number().int().positive(),
        venueAuthority: z
          .string()
          .default("HLgXScitaoBUU3S9DhqBSHSXuHzgDX3kdSVJ2YzsS6HR"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;
      // Check if user is an artist
      if (user.role !== "ARTIST") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only artists can create events",
        });
      }
      // Get the artist profile
      const artistProfile = await ctx.db.artistProfile.findUnique({
        where: { userId: user.id },
      });
      if (!artistProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Artist profile not found",
        });
      }

      // Extract the fields that don't match the schema
      const { artistWallet, managerPDA, capacity, ...restInput } = input;

      // Create the event with properly named fields and initialize ticketsRemaining equal to capacity
      const event = await ctx.db.event.create({
        data: {
          ...restInput,
          capacity,
          ticketsRemaining: capacity,
          artistId: artistProfile.id,
          artistWallet,
          managerPDA,
        },
      });
      return event;
    }),

  // Update an event (only for the artist who created it)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        eventName: z.string().min(3).max(100).optional(),
        eventDate: z.date().optional(),
        venue: z.string().min(3).max(100).optional(),
        city: z.string().min(2).max(50).optional(),
        category: z.nativeEnum(Category).optional(),
        capacity: z.number().int().positive().optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        artistWallet: z.string().optional(),
        managerPDA: z.string().optional(),
        isTicketTransferable: z.boolean().optional(),
        eventPublicKey: z.string(),
        ticketPrice: z.number().min(0).optional(),
        ticketsRemaining: z.number().int().optional(),
        venueAuthority: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, capacity, ticketsRemaining, ...updateData } = input;
      const { user } = ctx.session;

      // Fetch the event to check permissions
      const event = await ctx.db.event.findUnique({
        where: { id },
        include: {
          artist: true,
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if the current user owns this event
      const artistProfile = await ctx.db.artistProfile.findUnique({
        where: { userId: user.id },
      });

      if (!artistProfile || event.artistId !== artistProfile.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own events",
        });
      }

      // If capacity is updated and it's greater than the current capacity,
      // increase ticketsRemaining by the difference
      let ticketsData = {};
      if (capacity && capacity > event.capacity) {
        const difference = capacity - event.capacity;
        ticketsData = {
          ticketsRemaining: event.ticketsRemaining + difference,
        };
      } else if (capacity && capacity < event.capacity) {
        // If reducing capacity, ensure ticketsRemaining doesn't exceed new capacity
        ticketsData = {
          ticketsRemaining: Math.min(event.ticketsRemaining, capacity),
        };
      }

      // If ticketsRemaining is explicitly provided, use that value
      if (ticketsRemaining !== undefined) {
        ticketsData = {
          ticketsRemaining,
        };
      }

      // Update the event
      const updatedEvent = await ctx.db.event.update({
        where: { id },
        data: {
          ...updateData,
          ...(capacity ? { capacity } : {}),
          ...ticketsData,
        },
      });

      return updatedEvent;
    }),

  // Delete an event (only for the artist who created it)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { user } = ctx.session;

      // Fetch the event to check permissions
      const event = await ctx.db.event.findUnique({
        where: { id },
        include: {
          artist: true,
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if the current user owns this event
      const artistProfile = await ctx.db.artistProfile.findUnique({
        where: { userId: user.id },
      });

      if (!artistProfile || event.artistId !== artistProfile.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own events",
        });
      }

      // Delete the event
      await ctx.db.event.delete({
        where: { id },
      });

      return { success: true };
    }),

  // Get events by artist name (fuzzy search)
  searchByArtist: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const { query } = input;

      const events = await ctx.db.event.findMany({
        where: {
          artist: {
            artistName: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          eventDate: "asc",
        },
      });

      return events;
    }),

  // Get upcoming events
  getUpcoming: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit = 5 } = input;

      const events = await ctx.db.event.findMany({
        where: {
          eventDate: {
            gte: new Date(),
          },
        },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          eventDate: "asc",
        },
        take: limit,
      });

      return events;
    }),

  // Get events by category
  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(Category),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { category, limit = 10 } = input;

      const events = await ctx.db.event.findMany({
        where: {
          category,
          eventDate: {
            gte: new Date(),
          },
        },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          eventDate: "asc",
        },
        take: limit,
      });

      return events;
    }),

  // New procedure for updating ticketsRemaining when tickets are purchased
  updateTicketCount: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        ticketsPurchased: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, ticketsPurchased } = input;

      // Get the current event
      const event = await ctx.db.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if there are enough tickets remaining
      if (event.ticketsRemaining < ticketsPurchased) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough tickets available",
        });
      }

      // Update the ticketsRemaining count
      const updatedEvent = await ctx.db.event.update({
        where: { id: eventId },
        data: {
          ticketsRemaining: event.ticketsRemaining - ticketsPurchased,
        },
      });

      return updatedEvent;
    }),
});
