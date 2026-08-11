-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'graduate',
ADD COLUMN     "emailAnnouncements" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailImportant" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailResources" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "platformUpdates" BOOLEAN NOT NULL DEFAULT false;
