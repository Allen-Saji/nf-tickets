import { createCallerFactory, createTRPCRouter } from "@/server/trpc";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
