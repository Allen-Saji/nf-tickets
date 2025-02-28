import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const artistRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        artistName: z.string().min(1, "Artist name is required"),
        bio: z.string().optional(),
        genre: z.string().min(1, "Genre is required"),
        profilePictureUrl: z.string().url().optional(),
        backgroundImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user already has an artist profile
      const existingProfile = await ctx.db.artistProfile.findUnique({
        where: {
          userId,
        },
      });

      if (existingProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already has an artist profile",
        });
      }

      // Create artist profile and update user role in a transaction
      return ctx.db.$transaction(async (tx) => {
        // Create the artist profile
        const artistProfile = await tx.artistProfile.create({
          data: {
            userId,
            artistName: input.artistName,
            bio: input.bio,
            genre: input.genre,
            profilePictureUrl: input.profilePictureUrl,
            backgroundImageUrl: input.backgroundImageUrl,
          },
        });

        // Update the user's role to ARTIST
        const updatedUser = await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            role: Role.ARTIST,
          },
        });

        return {
          artistProfile,
          user: updatedUser,
        };
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        artistName: z.string().min(1, "Artist name is required").optional(),
        bio: z.string().optional(),
        genre: z.string().min(1, "Genre is required").optional(),
        profilePictureUrl: z.string().url().optional(),
        backgroundImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user has an artist profile
      const existingProfile = await ctx.db.artistProfile.findUnique({
        where: {
          userId,
        },
      });

      if (!existingProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      // Update the artist profile
      return ctx.db.artistProfile.update({
        where: {
          userId,
        },
        data: {
          ...input,
        },
      });
    }),

  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const artistProfile = await ctx.db.artistProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!artistProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Artist profile not found",
      });
    }

    return artistProfile;
  }),

  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const artistProfile = await ctx.db.artistProfile.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (!artistProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist profile not found",
        });
      }

      return artistProfile;
    }),
});
