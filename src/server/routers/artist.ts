import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";

export const artistRouter = createTRPCRouter({
  // New artist signup procedure - creates both user and artist profile
  signup: publicProcedure
    .input(
      z.object({
        // User data
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        // Artist profile data
        artistName: z.string().min(1, "Artist name is required"),
        bio: z.string().optional(),
        genre: z.string().min(1, "Genre is required"),
        profilePictureUrl: z.string().url().optional().nullable(),
        backgroundImageUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user with this email already exists
      const existingUser = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await hash(input.password, 10);

      // Use a transaction to create both user and artist profile
      return ctx.db.$transaction(async (tx) => {
        // Create the user with ARTIST role
        const newUser = await tx.user.create({
          data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: Role.ARTIST,
          },
        });

        // Create the artist profile
        const artistProfile = await tx.artistProfile.create({
          data: {
            userId: newUser.id,
            artistName: input.artistName,
            bio: input.bio,
            genre: input.genre,
            profilePictureUrl: input.profilePictureUrl,
            backgroundImageUrl: input.backgroundImageUrl,
          },
        });
      });
    }),

  // Your existing procedures
  create: protectedProcedure
    .input(
      z.object({
        artistName: z.string().min(1, "Artist name is required"),
        bio: z.string().optional(),
        genre: z.string().min(1, "Genre is required"),
        profilePictureUrl: z.string().url().optional().nullable(),
        backgroundImageUrl: z.string().url().optional().nullable(),
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
        profilePictureUrl: z.string().url().optional().nullable(),
        backgroundImageUrl: z.string().url().optional().nullable(),
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
      include: {
        user: {
          select: {
            name: true,
            email: true,
            wallets: true,
          },
        },
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
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
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

  // Get artist by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const artistProfile = await ctx.db.artistProfile.findUnique({
        where: {
          id: input.id,
        },
        include: {
          events: true,
          user: {
            select: {
              name: true,
            },
          },
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
