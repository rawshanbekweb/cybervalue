-- New materials allow three attempts instead of one.
ALTER TABLE "StudentMaterial" ALTER COLUMN "maxAttempts" SET DEFAULT 3;

-- Tests limited to one or two attempts get three, so a student can retake
-- them. Unlimited (0) and larger limits are kept as the teacher set them.
UPDATE "StudentMaterial" SET "maxAttempts" = 3
WHERE "kind" = 'QUIZ' AND "maxAttempts" IN (1, 2);
