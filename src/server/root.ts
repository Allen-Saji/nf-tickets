import { createCallerFactory, createTRPCRouter } from "@/server/trpc";
import { userRouter } from "./routers/user";
import { artistRouter } from "./routers/artist";
import { eventRouter } from "./routers/event";

export const appRouter = createTRPCRouter({
  user: userRouter,
  artist: artistRouter,
  event: eventRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
