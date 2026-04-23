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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("createdAt", "description", "experienceYears", "hrId", "id", "industry", "jobFunction", "jobType", "location", "requiredSkills", "screeningQuestions", "seniorityLevel", "status", "title", "workplaceType") SELECT "createdAt", "description", "experienceYears", "hrId", "id", "industry", "jobFunction", "jobType", "location", "requiredSkills", "screeningQuestions", "seniorityLevel", "status", "title", "workplaceType" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
