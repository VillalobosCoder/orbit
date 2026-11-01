INSERT INTO "modules" ("parent_id", "key", "name", "icon", "sort_order")
SELECT parent."id", child."key", child."name", NULL, child."sort_order"
FROM "modules" AS parent
CROSS JOIN (VALUES
  ('projects.issues', 'Issues', 21),
  ('projects.move_issues', 'Mover issues', 22),
  ('projects.sprints', 'Sprints', 23),
  ('projects.columns', 'Columnas', 24)
) AS child("key", "name", "sort_order")
WHERE parent."key" = 'projects'
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
INSERT INTO "user_permissions" ("user_id", "module_id", "can_read", "can_write")
SELECT up."user_id", child."id", true, true
FROM "user_permissions" AS up
INNER JOIN "modules" AS parent ON parent."id" = up."module_id" AND parent."key" = 'projects'
INNER JOIN "modules" AS child ON child."parent_id" = parent."id"
WHERE up."can_write" = true
ON CONFLICT ("user_id", "module_id") DO NOTHING;
