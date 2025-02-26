/*
  Warnings:

  - You are about to drop the column `genre` on the `ArtistProfile` table. All the data in the column will be lost.
  - Added the required column `category` to the `ArtistProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Music', 'Comedy', 'Tech', 'Dance', 'Sports');

-- AlterTable
ALTER TABLE "ArtistProfile" DROP COLUMN "genre",
ADD COLUMN     "category" "Category" NOT NULL;
