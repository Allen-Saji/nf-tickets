import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { hash, compare } from "bcrypt";
import { signIn } from "next-auth/react";

export const userRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "You are authenticated!";
  }),

  getProfile: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
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
        throw new Error("User with this email already exists");
      }

      const hashedPassword = await hash(input.password, 10);

      const newUser = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: "ATTENDEE",
        },
      });

      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // You might still want to validate the user exists first
      const user = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user || !user.password) {
        throw new Error("Invalid email or password");
      }

      // Use NextAuth's signIn function
      const result = await signIn("credentials", {
        redirect: false,
        email: input.email,
        password: input.password,
      });

      if (result?.error) {
        throw new Error(result.error || "Authentication failed");
      }

      // On success, NextAuth will create the session automatically
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),
});
