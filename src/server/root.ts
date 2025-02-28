import { createCallerFactory, createTRPCRouter } from "@/server/trpc";
import { userRouter } from "./routers/user";
import { artistRouter } from "./routers/artist";

export const appRouter = createTRPCRouter({
  user: userRouter,
  artist: artistRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
