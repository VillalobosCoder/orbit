UPDATE "priorities"
SET "name" = 'Urgencia', "level" = 1, "color" = '#991b1b'
WHERE "project_id" IS NULL AND "name" = 'Crítica';--> statement-breakpoint
UPDATE "priorities"
SET "level" = 3
WHERE "project_id" IS NULL AND "name" = 'Alta';--> statement-breakpoint
UPDATE "priorities"
SET "level" = 4
WHERE "project_id" IS NULL AND "name" = 'Media';--> statement-breakpoint
UPDATE "priorities"
SET "level" = 5
WHERE "project_id" IS NULL AND "name" = 'Baja';--> statement-breakpoint
INSERT INTO "priorities" ("project_id", "name", "level", "color")
SELECT NULL, seed."name", seed."level", seed."color"
FROM (VALUES
  ('Muy alta', 2, '#dc2626'),
  ('Muy baja', 6, '#0d9488')
) AS seed("name", "level", "color")
WHERE NOT EXISTS (
  SELECT 1 FROM "priorities"
  WHERE "project_id" IS NULL AND "priorities"."name" = seed."name"
);
