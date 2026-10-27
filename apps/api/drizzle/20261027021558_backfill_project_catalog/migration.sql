INSERT INTO "board_columns" ("project_id", "name", "category", "position")
SELECT p."id", c."name", c."category", c."position"
FROM "projects" AS p
CROSS JOIN (VALUES
  ('Por hacer', 'todo', 0),
  ('En curso', 'in_progress', 1),
  ('Finalizada', 'done', 2)
) AS c("name", "category", "position")
ON CONFLICT ("project_id", "name") DO NOTHING;--> statement-breakpoint
INSERT INTO "issue_types" ("project_id", "name", "is_subtask", "icon")
SELECT p."id", t."name", t."is_subtask", t."icon"
FROM "projects" AS p
CROSS JOIN (VALUES
  ('Tarea', false, 'CheckSquare'),
  ('Historia', false, 'BookOpen'),
  ('Bug', false, 'Bug'),
  ('Subtarea', true, 'ListTree')
) AS t("name", "is_subtask", "icon")
ON CONFLICT ("project_id", "name") DO NOTHING;
