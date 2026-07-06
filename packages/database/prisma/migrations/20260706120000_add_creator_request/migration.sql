-- Create table for creator onboarding requests
CREATE TABLE IF NOT EXISTS "creator_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "bio" TEXT,
  "sampleUrl" TEXT,
  "idFileUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "creator_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "creator_requests_userId_idx" ON "creator_requests"("userId");

ALTER TABLE "creator_requests" ADD CONSTRAINT IF NOT EXISTS "creator_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
