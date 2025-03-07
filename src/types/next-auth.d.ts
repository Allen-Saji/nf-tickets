// next-auth.d.ts
import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      artistProfile?: {
        id: number;
        userId: string;
        artistName: string;
        bio: string | null;
        genre: string;
        profilePictureUrl: string | null;
        backgroundImageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
