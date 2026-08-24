CREATE TABLE "HomepageContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "hero" JSONB NOT NULL,
    "stats" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);
