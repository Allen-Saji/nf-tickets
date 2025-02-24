import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, artistName, bio, category, walletAddress } = body;

    // Basic validation for required fields
    if (!userId || !artistName || !walletAddress || !category) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (userId, artistName, walletAddress, category)",
        },
        { status: 400 }
      );
    }

    // Create the artist profile in the database
    const newProfile = await prisma.artistProfile.create({
      data: {
        userId,
        artistName,
        bio,
        category,
        walletAddress,
      },
    });

    // Return success response
    return NextResponse.json(
      { success: true, data: newProfile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating artist profile:", error);
    return NextResponse.json(
      { error: "Failed to create artist profile" },
      { status: 500 }
    );
  }
}
