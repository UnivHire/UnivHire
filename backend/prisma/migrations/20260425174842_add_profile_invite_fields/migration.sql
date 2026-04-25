-- AlterTable
ALTER TABLE "User" ADD COLUMN "about" TEXT;
ALTER TABLE "User" ADD COLUMN "availability" TEXT;
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
ALTER TABLE "User" ADD COLUMN "department" TEXT;
ALTER TABLE "User" ADD COLUMN "designation" TEXT;
ALTER TABLE "User" ADD COLUMN "experienceLevel" TEXT;
ALTER TABLE "User" ADD COLUMN "headline" TEXT;
ALTER TABLE "User" ADD COLUMN "linkedin" TEXT;
ALTER TABLE "User" ADD COLUMN "location" TEXT;
ALTER TABLE "User" ADD COLUMN "notificationSettings" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "portfolioUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "preferences" TEXT;
ALTER TABLE "User" ADD COLUMN "preferredRole" TEXT;
ALTER TABLE "User" ADD COLUMN "resumeUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "skills" TEXT;
ALTER TABLE "User" ADD COLUMN "website" TEXT;

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'HR',
    "senderId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hrId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "workplaceType" TEXT NOT NULL DEFAULT 'ON_SITE',
    "seniorityLevel" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "jobFunction" TEXT NOT NULL DEFAULT '',
    "industry" TEXT NOT NULL DEFAULT '',
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "requiredSkills" TEXT NOT NULL DEFAULT '',
    "screeningQuestions" TEXT NOT NULL DEFAULT '',
    "applicationMode" TEXT NOT NULL DEFAULT 'PLATFORM',
    "applicationEmail" TEXT NOT NULL DEFAULT '',
    "requireResume" BOOLEAN NOT NULL DEFAULT true,
    "externalApplyUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("applicationEmail", "applicationMode", "createdAt", "description", "experienceYears", "externalApplyUrl", "hrId", "id", "industry", "jobFunction", "jobType", "location", "organizationName", "requireResume", "requiredSkills", "screeningQuestions", "seniorityLevel", "status", "title", "workplaceType") SELECT "applicationEmail", "applicationMode", "createdAt", "description", "experienceYears", "externalApplyUrl", "hrId", "id", "industry", "jobFunction", "jobType", "location", "organizationName", "requireResume", "requiredSkills", "screeningQuestions", "seniorityLevel", "status", "title", "workplaceType" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE TABLE "new_SavedJob" (
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("candidateId", "jobId"),
    CONSTRAINT "SavedJob_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SavedJob" ("candidateId", "jobId") SELECT "candidateId", "jobId" FROM "SavedJob";
DROP TABLE "SavedJob";
ALTER TABLE "new_SavedJob" RENAME TO "SavedJob";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");
