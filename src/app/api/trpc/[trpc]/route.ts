import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { env } from "@/env";
import { appRouter } from "@/server/root";
import { createTRPCContext } from "@/server/trpc";
import { NextRequest } from "next/server";
const handler = async (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
