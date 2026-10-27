INSERT INTO "priorities" ("project_id", "name", "level", "color")
SELECT NULL, seed."name", seed."level", seed."color"
FROM (VALUES
  ('Crítica', 1, '#dc2626'),
  ('Alta', 2, '#ea580c'),
  ('Media', 3, '#ca8a04'),
  ('Baja', 4, '#16a34a')
) AS seed("name", "level", "color")
WHERE NOT EXISTS (
  SELECT 1 FROM "priorities"
  WHERE "project_id" IS NULL AND "priorities"."name" = seed."name"
);
