import { createCallerFactory, createTRPCRouter } from "@/server/trpc";

export const appRouter = createTRPCRouter({});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
