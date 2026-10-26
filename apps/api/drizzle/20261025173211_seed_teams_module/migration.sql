INSERT INTO "modules" ("key", "name", "icon", "sort_order")
VALUES ('teams', 'Teams', 'UsersRound', 20)
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
INSERT INTO "user_permissions" ("user_id", "module_id", "can_read", "can_write")
SELECT DISTINCT up."user_id", teams_module."id", true, true
FROM "user_permissions" AS up
INNER JOIN "modules" AS users_module ON users_module."id" = up."module_id"
CROSS JOIN (SELECT "id" FROM "modules" WHERE "key" = 'teams') AS teams_module
WHERE users_module."key" = 'users' AND up."can_write" = true
ON CONFLICT ("user_id", "module_id") DO NOTHING;
