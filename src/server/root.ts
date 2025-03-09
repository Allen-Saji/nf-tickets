import { createCallerFactory, createTRPCRouter } from "@/server/trpc";
import { userRouter } from "./routers/user";
import { artistRouter } from "./routers/artist";
import { eventRouter } from "./routers/event";
import { ticketRouter } from "./routers/tickets";

export const appRouter = createTRPCRouter({
  user: userRouter,
  artist: artistRouter,
  event: eventRouter,
  ticket: ticketRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
