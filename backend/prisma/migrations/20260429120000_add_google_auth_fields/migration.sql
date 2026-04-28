-- RedefineTables
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "university" TEXT,
  "avatar" TEXT,
  "phone" TEXT,
  "headline" TEXT,
  "about" TEXT,
  "resumeUrl" TEXT,
  "portfolioUrl" TEXT,
  "experienceLevel" TEXT,
  "availability" TEXT,
  "skills" TEXT,
  "preferredRole" TEXT,
  "location" TEXT,
  "designation" TEXT,
  "department" TEXT,
  "website" TEXT,
  "linkedin" TEXT,
  "bio" TEXT,
  "notificationSettings" TEXT,
  "preferences" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_User" ("id","email","passwordHash","name","role","university","phone","headline","about","resumeUrl","portfolioUrl","experienceLevel","availability","skills","preferredRole","location","designation","department","website","linkedin","bio","notificationSettings","preferences","createdAt")
SELECT "id","email","passwordHash","name","role","university","phone","headline","about","resumeUrl","portfolioUrl","experienceLevel","availability","skills","preferredRole","location","designation","department","website","linkedin","bio","notificationSettings","preferences","createdAt" FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
