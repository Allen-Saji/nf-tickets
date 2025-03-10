import { createTRPCRouter, protectedProcedure } from "../trpc";

export const platformRouter = createTRPCRouter({
  getPlatform: protectedProcedure.query(({ ctx }) => {
    return ctx.db.platform.findMany();
  }),
});
