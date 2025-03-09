import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const ticketRouter = createTRPCRouter({
  // Create a new ticket
  createTicket: protectedProcedure
    .input(
      z.object({
        ticketAddress: z.string(),
        ownerWallet: z.string(),
        txnSignature: z.string(),
        eventId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { ticketAddress, ownerWallet, txnSignature, eventId } = input;

      // Check if the event exists
      const event = await ctx.db.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if the ticket address already exists
      const existingTicket = await ctx.db.ticket.findUnique({
        where: { ticketAddress },
      });

      if (existingTicket) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ticket with this address already exists",
        });
      }

      // Create the ticket
      const ticket = await ctx.db.ticket.create({
        data: {
          ticketAddress,
          ownerWallet,
          txnSignature,
          eventId,
        },
      });

      return ticket;
    }),

  // Get tickets for an event
  getTicketsByEventId: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { eventId } = input;

      const tickets = await ctx.db.ticket.findMany({
        where: { eventId },
        include: {
          event: true,
        },
      });

      return tickets;
    }),

  // Get tickets owned by a user
  getTicketsByOwner: protectedProcedure
    .input(z.object({ ownerWallet: z.string() }))
    .query(async ({ ctx, input }) => {
      const { ownerWallet } = input;
      const { user } = ctx.session;

      // Get user's wallet address if not provided
      const actualWallet = ownerWallet || user.id;

      if (!actualWallet) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No wallet address provided or associated with user",
        });
      }

      const tickets = await ctx.db.ticket.findMany({
        where: { ownerWallet: actualWallet },
        include: {
          event: {
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
          },
        },
      });

      return tickets;
    }),

  // Transfer a ticket to a new owner
  transferTicket: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        newOwnerWallet: z.string(),
        txnSignature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { ticketId, newOwnerWallet, txnSignature } = input;
      const { user } = ctx.session;

      // Find the ticket
      const ticket = await ctx.db.ticket.findUnique({
        where: { id: ticketId },
        include: {
          event: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }

      // Check if ticket is transferable
      if (!ticket.event.isTicketTransferable) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This ticket is not transferable",
        });
      }

      // Check if user owns the ticket
      const userWallet = user.id;
      if (!userWallet || ticket.ownerWallet !== userWallet) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only transfer tickets you own",
        });
      }

      // Update the ticket
      const updatedTicket = await ctx.db.ticket.update({
        where: { id: ticketId },
        data: {
          ownerWallet: newOwnerWallet,
          txnSignature,
        },
      });

      return updatedTicket;
    }),

  // Get ticket by address
  getTicketByAddress: publicProcedure
    .input(z.object({ ticketAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const { ticketAddress } = input;

      const ticket = await ctx.db.ticket.findUnique({
        where: { ticketAddress },
        include: {
          event: {
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
          },
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }

      return ticket;
    }),
});
