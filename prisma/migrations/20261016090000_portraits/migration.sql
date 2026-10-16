-- A student's animated portrait: particle points computed from their photo.
ALTER TABLE "Student" ADD COLUMN "portrait" JSONB;

-- Site-wide settings edited from the CMS, such as the home page portrait.
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);
